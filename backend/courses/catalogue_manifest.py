"""Load and validate the official CAITECH course catalogue manifest."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

MANIFEST_PATH = Path(__file__).resolve().parent / 'data' / 'official_catalogue_manifest.json'

REQUIRED_COURSE_FIELDS = (
    'source_id',
    'title',
    'primary_category_id',
    'eligible_for_sync',
)
REQUIRED_CATEGORY_FIELDS = ('id', 'name', 'slug', 'display_order')


class ManifestValidationError(ValueError):
    """Raised when the official catalogue manifest fails validation."""


def default_manifest_path() -> Path:
    return MANIFEST_PATH


def load_manifest(path: Path | str | None = None) -> dict[str, Any]:
    manifest_path = Path(path) if path else default_manifest_path()
    if not manifest_path.is_file():
        raise ManifestValidationError(f'Manifest not found: {manifest_path}')
    try:
        data = json.loads(manifest_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as exc:
        raise ManifestValidationError(f'Invalid JSON in manifest: {exc}') from exc
    if not isinstance(data, dict):
        raise ManifestValidationError('Manifest root must be an object')
    return data


def validate_manifest(data: dict[str, Any]) -> list[str]:
    """Return a list of validation error strings (empty means valid)."""
    errors: list[str] = []
    categories = data.get('categories') or data.get('taxonomy')
    courses = data.get('courses')
    if not isinstance(categories, list) or not categories:
        errors.append('manifest.categories must be a non-empty list')
        categories = []
    if not isinstance(courses, list) or not courses:
        errors.append('manifest.courses must be a non-empty list')
        courses = []

    cat_ids: set[str] = set()
    cat_slugs: set[str] = set()
    for i, cat in enumerate(categories):
        if not isinstance(cat, dict):
            errors.append(f'categories[{i}] must be an object')
            continue
        for field in REQUIRED_CATEGORY_FIELDS:
            if field not in cat or cat[field] in (None, ''):
                errors.append(f'categories[{i}].{field} is required')
        cid = cat.get('id')
        slug = cat.get('slug')
        if isinstance(cid, str):
            if cid in cat_ids:
                errors.append(f'duplicate category id: {cid}')
            cat_ids.add(cid)
        if isinstance(slug, str):
            if slug in cat_slugs:
                errors.append(f'duplicate category slug: {slug}')
            cat_slugs.add(slug)
        order = cat.get('display_order')
        if order is not None and not isinstance(order, int):
            errors.append(f'categories[{i}].display_order must be an integer')

    source_ids: set[str] = set()
    for i, course in enumerate(courses):
        if not isinstance(course, dict):
            errors.append(f'courses[{i}] must be an object')
            continue
        for field in REQUIRED_COURSE_FIELDS:
            if field not in course:
                errors.append(f'courses[{i}].{field} is required')
        sid = course.get('source_id')
        if isinstance(sid, str) and sid:
            if sid in source_ids:
                errors.append(f'duplicate course source_id: {sid}')
            source_ids.add(sid)
        else:
            errors.append(f'courses[{i}].source_id must be a non-empty string')
        title = course.get('title')
        if not isinstance(title, str) or not title.strip():
            errors.append(f'courses[{i}].title must be a non-empty string')
        cat_id = course.get('primary_category_id')
        if cat_id not in cat_ids:
            errors.append(
                f'courses[{i}] ({sid}) primary_category_id={cat_id!r} not in taxonomy'
            )
        eligible = course.get('eligible_for_sync')
        if not isinstance(eligible, bool):
            errors.append(f'courses[{i}].eligible_for_sync must be a boolean')
        if course.get('description') is not None and not isinstance(course.get('description'), str):
            errors.append(f'courses[{i}].description must be a string when present')
        if course.get('target_audience') is not None and not isinstance(
            course.get('target_audience'), (str, type(None))
        ):
            errors.append(f'courses[{i}].target_audience must be a string or null')

    return errors


def get_validated_manifest(path: Path | str | None = None) -> dict[str, Any]:
    data = load_manifest(path)
    errors = validate_manifest(data)
    if errors:
        raise ManifestValidationError(
            'Manifest validation failed:\n- ' + '\n- '.join(errors)
        )
    return data


def eligible_courses(data: dict[str, Any]) -> list[dict[str, Any]]:
    return [c for c in data.get('courses', []) if c.get('eligible_for_sync') is True]


def taxonomy_categories(data: dict[str, Any]) -> list[dict[str, Any]]:
    return list(data.get('categories') or data.get('taxonomy') or [])
