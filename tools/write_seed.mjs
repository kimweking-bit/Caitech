import fs from 'fs';
import path from 'path';

const root = 'backend/courses/management';
fs.mkdirSync(path.join(root, 'commands'), { recursive: true });
fs.writeFileSync(path.join(root, '__init__.py'), '');
fs.writeFileSync(path.join(root, 'commands', '__init__.py'), '');

const seed = `"""Seed a durable CAITECH demo dataset for local QA and client demos."""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from courses.models import (
    Assignment,
    AssignmentSubmission,
    Category,
    Choice,
    Course,
    CourseReview,
    Enrollment,
    Lesson,
    LessonProgress,
    Question,
    Quiz,
    QuizAttempt,
    Section,
)
from site_content.models import BlogPost

User = get_user_model()

DEMO_TAG = "[DEMO]"
STUDENT_EMAIL = "demo.student@caitech.test"
INSTRUCTOR_EMAIL = "demo.instructor@caitech.test"
ADMIN_EMAIL = "demo.admin@caitech.test"
DEMO_PASSWORD = "CaitechDemo2026!"


def _user(*, username, email, password, is_student=False, is_instructor=False, is_staff=False, first_name="", last_name=""):
    user, _ = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "is_student": is_student,
            "is_instructor": is_instructor,
            "is_verified_instructor": is_instructor,
            "is_staff": is_staff,
            "is_superuser": is_staff,
        },
    )
    user.email = email
    user.first_name = first_name or user.first_name
    user.last_name = last_name or user.last_name
    user.is_student = is_student
    user.is_instructor = is_instructor or is_staff
    user.is_verified_instructor = is_instructor or is_staff
    user.is_staff = is_staff
    user.is_superuser = is_staff
    user.set_password(password)
    user.save()
    return user


def _category(name, description=""):
    cat, _ = Category.objects.get_or_create(name=name, defaults={"description": description})
    if description and cat.description != description:
        cat.description = description
        cat.save(update_fields=["description"])
    return cat


def _course(**kwargs):
    slug = kwargs.pop("slug")
    course, _ = Course.objects.update_or_create(slug=slug, defaults=kwargs)
    return course


def _section(course, title, order):
    section, _ = Section.objects.update_or_create(course=course, order=order, defaults={"title": title})
    return section


def _lesson(section, title, order, *, preview=False, minutes=25, video_url=""):
    lesson, _ = Lesson.objects.update_or_create(
        section=section,
        order=order,
        defaults={
            "title": title,
            "is_preview": preview,
            "duration_minutes": minutes,
            "video_url": video_url or "",
        },
    )
    return lesson


class Command(BaseCommand):
    help = "Seed durable CAITECH demo users, programmes, curriculum, LMS content, and enrollments."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default=DEMO_PASSWORD,
            help="Password for all demo accounts (default: CaitechDemo2026!).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        self.stdout.write("Seeding CAITECH demo dataset...")

        student = _user(
            username="demo.student",
            email=STUDENT_EMAIL,
            password=password,
            is_student=True,
            first_name="Demo",
            last_name="Student",
        )
        instructor = _user(
            username="demo.instructor",
            email=INSTRUCTOR_EMAIL,
            password=password,
            is_instructor=True,
            first_name="Demo",
            last_name="Instructor",
        )
        _user(
            username="demo.admin",
            email=ADMIN_EMAIL,
            password=password,
            is_instructor=True,
            is_staff=True,
            first_name="Demo",
            last_name="Admin",
        )

        cat_cad = _category(
            f"{DEMO_TAG} School of CAD & Technology",
            "Demo category for Computer Aided Design and digital construction programmes.",
        )
        cat_ict = _category(
            f"{DEMO_TAG} School of ICT",
            "Demo category for information and communication technology programmes.",
        )
        cat_build = _category(
            f"{DEMO_TAG} School of Building Technology",
            "Demo category for building, surveying and construction programmes.",
        )

        bim = _course(
            slug="demo-bim-digital-construction",
            title=f"{DEMO_TAG} BIM & Digital Construction Practice",
            short_description="Six-module DEMO path from CAD foundations to coordinated BIM documentation.",
            description=(
                "Demo programme for client walkthroughs. Six modular units map a practical path from CAD foundations "
                "through Revit modelling, coordination and documentation. Content is labelled DEMO and is not official "
                "CAITECH curriculum copy."
            ),
            category=cat_cad,
            instructor=instructor,
            price=Decimal("45000.00"),
            original_price=Decimal("52000.00"),
            level=Course.Level.INTERMEDIATE,
            duration="6 months · 6 modules",
            course_type=Course.CourseType.CERTIFICATE,
            delivery_modes=[Course.DeliveryMode.PHYSICAL, Course.DeliveryMode.ONLINE],
            intake_status=Course.IntakeStatus.ONGOING,
            learning_outcomes=[
                "Produce coordinated BIM models for building elements",
                "Apply CAD drafting standards used in technical practice contexts",
                "Document sheets and schedules for review packages",
                "Collaborate on model exchanges and clash notes",
            ],
            skills_gained=["AutoCAD", "Revit", "BIM coordination", "Technical documentation"],
            tools_covered=["AutoCAD", "Revit", "Navisworks (intro)", "PDF markup tools"],
            is_published=True,
            is_available=True,
        )

        s1 = _section(bim, "Module 1 — CAD foundations", 1)
        s2 = _section(bim, "Module 2 — Architectural modelling in Revit", 2)
        s3 = _section(bim, "Module 3 — Structure & documentation", 3)
        s4 = _section(bim, "Module 4 — Coordination workflows", 4)
        s5 = _section(bim, "Module 5 — Project package", 5)
        s6 = _section(bim, "Module 6 — Review & professional practice", 6)

        lessons = [
            _lesson(s1, "Welcome & studio expectations", 1, preview=True, minutes=12),
            _lesson(s1, "Drawing standards and layers", 2, preview=True, minutes=28),
            _lesson(s1, "2D drafting drills", 3, minutes=35),
            _lesson(s2, "Revit project setup", 1, minutes=30),
            _lesson(s2, "Walls, floors and roofs", 2, minutes=40),
            _lesson(s2, "Views and sheets", 3, minutes=32),
            _lesson(s3, "Structural grids and levels", 1, minutes=30),
            _lesson(s3, "Schedules and tags", 2, minutes=28),
            _lesson(s4, "Model exchange basics", 1, minutes=26),
            _lesson(s4, "Clash note workflow", 2, minutes=30),
            _lesson(s5, "Issue set preparation", 1, minutes=34),
            _lesson(s6, "Portfolio critique checklist", 1, minutes=22),
        ]
