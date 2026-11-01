"""
Additive, non-destructive sync of the official CAITECH course catalogue.

Usage:
  python manage.py sync_official_catalogue --dry-run
  python manage.py sync_official_catalogue
  python manage.py sync_official_catalogue --manifest path/to/manifest.json

Never deletes courses, categories, enrollments, or operational fields.
"""
from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from courses.catalogue_manifest import (
    ManifestValidationError,
    eligible_courses,
    get_validated_manifest,
    taxonomy_categories,
)
from courses.models import Category, Course

User = get_user_model()

CATALOGUE_INSTRUCTOR_USERNAME = 'caitech_catalogue'
CATALOGUE_INSTRUCTOR_EMAIL = 'catalogue@caitech.local'


class Command(BaseCommand):
    help = (
        'Synchronise official catalogue categories and courses from the '
        'canonical manifest (additive, non-destructive).'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate and report changes without writing to the database.',
        )
        parser.add_argument(
            '--manifest',
            type=str,
            default=None,
            help='Optional path to an alternate manifest JSON file.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        try:
            manifest = get_validated_manifest(options.get('manifest'))
        except ManifestValidationError as exc:
            raise CommandError(str(exc)) from exc

        categories_spec = taxonomy_categories(manifest)
        courses_spec = eligible_courses(manifest)
        skipped = [
            c for c in manifest.get('courses', []) if not c.get('eligible_for_sync')
        ]

        summary = {
            'dry_run': dry_run,
            'categories_created': [],
            'categories_updated': [],
            'categories_unchanged': [],
            'courses_created': [],
            'courses_updated': [],
            'courses_unchanged': [],
            'courses_skipped_conflict': [],
            'manifest_excluded': [c.get('source_id') for c in skipped],
        }

        try:
            if dry_run:
                self._plan(categories_spec, courses_spec, summary)
            else:
                with transaction.atomic():
                    self._apply(categories_spec, courses_spec, summary)
        except Exception as exc:
            raise CommandError(f'Sync failed: {exc}') from exc

        self._print_summary(summary)
        if summary['courses_skipped_conflict']:
            self.stdout.write(
                self.style.WARNING(
                    f"{len(summary['courses_skipped_conflict'])} conflict(s) skipped."
                )
            )

    def _ensure_instructor(self):
        """Return a stable instructor account for official catalogue courses."""
        User = get_user_model()
        email = 'catalogue.instructor@caitech.local'
        field_names = {f.name for f in User._meta.fields}
        lookup = {}
        defaults = {
            'first_name': 'CAITECH',
            'last_name': 'Instructor',
            'is_active': True,
        }
        if 'email' in field_names:
            lookup['email'] = email
            defaults['email'] = email
        if 'username' in field_names:
            username = 'caitech.catalogue.instructor'
            if 'email' not in lookup:
                lookup['username'] = username
            else:
                defaults['username'] = username
        if 'is_instructor' in field_names:
            defaults['is_instructor'] = True
        # accounts.User has is_instructor, not role — never set role.
        user, created = User.objects.get_or_create(**lookup, defaults=defaults)
        updates = []
        if 'is_instructor' in field_names and not getattr(user, 'is_instructor', False):
            user.is_instructor = True
            updates.append('is_instructor')
        if 'first_name' in field_names and not (user.first_name or '').strip():
            user.first_name = 'CAITECH'
            updates.append('first_name')
        if 'last_name' in field_names and not (user.last_name or '').strip():
            user.last_name = 'Instructor'
            updates.append('last_name')
        if created and hasattr(user, 'set_unusable_password'):
            try:
                user.set_unusable_password()
                user.save()
            except Exception:
                pass
            return user, created
        if updates:
            user.save(update_fields=updates)
        return user, created

    def _plan(self, categories_spec, courses_spec, summary):
        for cat in categories_spec:
            existing = Category.objects.filter(slug=cat['slug']).first()
            if existing is None:
                summary['categories_created'].append(cat['slug'])
            else:
                needs = (
                    existing.name != cat['name']
                    or existing.display_order != cat['display_order']
                    or not existing.is_official
                )
                if needs:
                    summary['categories_updated'].append(cat['slug'])
                else:
                    summary['categories_unchanged'].append(cat['slug'])

        instructor_exists = User.objects.filter(
            username=CATALOGUE_INSTRUCTOR_USERNAME
        ).exists()
        if not instructor_exists:
            self.stdout.write(
                'Would create catalogue instructor user '
                f'{CATALOGUE_INSTRUCTOR_USERNAME!r}'
            )

        for course in courses_spec:
            sid = course['source_id']
            by_source = Course.objects.filter(source_id=sid).first()
            if by_source:
                if self._course_needs_update(by_source, course):
                    summary['courses_updated'].append(sid)
                else:
                    summary['courses_unchanged'].append(sid)
                continue

            proposed = self._unique_slug_candidate(course)
            title_conflict = (
                Course.objects.filter(title=course['title'], source_id__isnull=True)
                .exclude(slug=proposed)
                .first()
            )
            slug_owner = Course.objects.filter(slug=proposed).first()
            if slug_owner and not slug_owner.source_id:
                summary['courses_skipped_conflict'].append(
                    {
                        'source_id': sid,
                        'reason': f'slug {proposed!r} owned by non-official course id={slug_owner.pk}',
                    }
                )
                continue
            if title_conflict:
                summary['courses_skipped_conflict'].append(
                    {
                        'source_id': sid,
                        'reason': f'title match without source_id on course id={title_conflict.pk}',
                    }
                )
                continue
            summary['courses_created'].append(sid)

    def _apply(self, categories_spec, courses_spec, summary):
        instructor, _ = self._ensure_instructor()
        cat_by_id: dict[str, Category] = {}

        for cat in categories_spec:
            sid = cat.get('id') or cat.get('source_id') or cat['slug']
            # Prefer source_id match, then slug (legacy demo rows may share a slug).
            obj = None
            if sid:
                obj = Category.objects.filter(source_id=sid).first()
            if obj is None:
                obj = Category.objects.filter(slug=cat['slug']).first()
            created = False
            if obj is None:
                obj = Category.objects.create(
                    slug=cat['slug'],
                    name=cat['name'],
                    display_order=cat['display_order'],
                    is_official=True,
                    description=cat.get('description') or '',
                    source_id=sid,
                )
                created = True
                summary['categories_created'].append(cat['slug'])
            else:
                changed = False
                if obj.name != cat['name']:
                    obj.name = cat['name']
                    changed = True
                if obj.slug != cat['slug']:
                    # Only retarget slug when free
                    if not Category.objects.filter(slug=cat['slug']).exclude(pk=obj.pk).exists():
                        obj.slug = cat['slug']
                        changed = True
                if obj.display_order != cat['display_order']:
                    obj.display_order = cat['display_order']
                    changed = True
                if not obj.is_official:
                    obj.is_official = True
                    changed = True
                if (obj.source_id or '') != sid:
                    obj.source_id = sid
                    changed = True
                desc = cat.get('description') or ''
                if (obj.description or '') != desc and desc:
                    obj.description = desc
                    changed = True
                if changed:
                    obj.save()
                    summary['categories_updated'].append(cat['slug'])
                else:
                    summary['categories_unchanged'].append(cat['slug'])
            cat_by_id[cat['id']] = obj

        for course in courses_spec:
            sid = course['source_id']
            category = cat_by_id.get(course['primary_category_id'])
            if category is None:
                summary['courses_skipped_conflict'].append(
                    {
                        'source_id': sid,
                        'reason': f"unknown category {course['primary_category_id']}",
                    }
                )
                continue

            existing = Course.objects.filter(source_id=sid).first()
            if existing:
                if self._apply_source_fields(existing, course, category):
                    summary['courses_updated'].append(sid)
                else:
                    summary['courses_unchanged'].append(sid)
                continue

            slug = self._unique_slug_candidate(course)
            slug_owner = Course.objects.filter(slug=slug).first()
            if slug_owner is not None:
                if slug_owner.source_id and slug_owner.source_id != sid:
                    summary['courses_skipped_conflict'].append(
                        {
                            'source_id': sid,
                            'reason': f'slug {slug!r} owned by source_id={slug_owner.source_id}',
                        }
                    )
                    continue
                if not slug_owner.source_id:
                    # Claim only if titles match closely; otherwise conflict
                    if slug_owner.title.strip().lower() == course['title'].strip().lower():
                        slug_owner.source_id = sid
                        slug_owner.is_official = True
                        self._apply_source_fields(slug_owner, course, category)
                        summary['courses_updated'].append(sid)
                        continue
                    summary['courses_skipped_conflict'].append(
                        {
                            'source_id': sid,
                            'reason': f'slug {slug!r} owned by non-official course id={slug_owner.pk}',
                        }
                    )
                    continue

            Course.objects.create(
                source_id=sid,
                is_official=True,
                title=course['title'][:200],
                slug=slug,
                short_description=(course.get('short_description') or '')[:280],
                description=course.get('description') or course['title'],
                target_audience=course.get('target_audience') or '',
                category=category,
                instructor=instructor,
                price=Decimal('0.00'),
                is_free=True,
                is_published=True,
                course_type=Course.CourseType.CERTIFICATE,
            )
            summary['courses_created'].append(sid)

    def _course_needs_update(self, obj: Course, course: dict) -> bool:
        audience = course.get('target_audience') or ''
        short = (course.get('short_description') or '')[:280]
        desc = course.get('description') or course['title']
        cat_slug = None
        # category checked by id via slug map in apply; plan only compares owned fields
        return (
            obj.title != course['title'][:200]
            or obj.short_description != short
            or obj.description != desc
            or (obj.target_audience or '') != audience
            or not obj.is_official
        )

    def _apply_source_fields(self, obj: Course, course: dict, category: Category) -> bool:
        """Update source-owned fields only. Returns True if saved."""
        changed = False
        title = course['title'][:200]
        short = (course.get('short_description') or '')[:280]
        desc = course.get('description') or course['title']
        audience = course.get('target_audience') or ''

        if obj.title != title:
            obj.title = title
            changed = True
        if obj.short_description != short:
            obj.short_description = short
            changed = True
        if obj.description != desc:
            obj.description = desc
            changed = True
        if (obj.target_audience or '') != audience:
            obj.target_audience = audience
            changed = True
        if obj.category_id != category.id:
            # Only reassign category for official rows already matched by source_id
            obj.category = category
            changed = True
        if not obj.is_official:
            obj.is_official = True
            changed = True
        if obj.source_id != course['source_id']:
            obj.source_id = course['source_id']
            changed = True
        if changed:
            obj.save()
        return changed

    def _unique_slug_candidate(self, course: dict) -> str:
        proposed = (course.get('proposed_slug') or slugify(course['title']) or course['source_id'])[
            :50
        ]
        base = proposed
        # If free or owned by same source, use it
        owner = Course.objects.filter(slug=proposed).first()
        if owner is None or owner.source_id == course['source_id']:
            return proposed
        # Prefer source_id based slug when collision
        sid_slug = slugify(course['source_id'])[:50]
        if not Course.objects.filter(slug=sid_slug).exists():
            return sid_slug
        n = 2
        while Course.objects.filter(slug=f'{base[:45]}-{n}').exists():
            n += 1
        return f'{base[:45]}-{n}'

    def _print_summary(self, summary: dict) -> None:
        mode = 'DRY-RUN' if summary['dry_run'] else 'APPLIED'
        self.stdout.write(self.style.MIGRATE_HEADING(f'Official catalogue sync ({mode})'))
        self.stdout.write(
            f"Categories: +{len(summary['categories_created'])} "
            f"~{len(summary['categories_updated'])} "
            f"={len(summary['categories_unchanged'])}"
        )
        if summary['categories_created']:
            self.stdout.write('  create: ' + ', '.join(summary['categories_created']))
        if summary['categories_updated']:
            self.stdout.write('  update: ' + ', '.join(summary['categories_updated']))
        self.stdout.write(
            f"Courses: +{len(summary['courses_created'])} "
            f"~{len(summary['courses_updated'])} "
            f"={len(summary['courses_unchanged'])} "
            f"!{len(summary['courses_skipped_conflict'])}"
        )
        if summary['courses_created'] and len(summary['courses_created']) <= 20:
            self.stdout.write('  create: ' + ', '.join(summary['courses_created']))
        elif summary['courses_created']:
            self.stdout.write(
                f"  create: {len(summary['courses_created'])} "
                f"(e.g. {', '.join(summary['courses_created'][:8])}…)"
            )
        if summary['courses_skipped_conflict']:
            for item in summary['courses_skipped_conflict']:
                self.stdout.write(
                    self.style.WARNING(
                        f"  conflict {item['source_id']}: {item['reason']}"
                    )
                )
        self.stdout.write(
            f"Manifest exclusions (not synced): {len(summary['manifest_excluded'])}"
        )
