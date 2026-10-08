"""Seed durable CAITECH demo dataset. Manual clear_demo only."""
from __future__ import annotations
from datetime import timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from courses.models import (
    Assignment, AssignmentSubmission, Category, Choice, Course, CourseReview,
    Enrollment, Lesson, LessonProgress, Question, Quiz, QuizAttempt, Section,
)
from site_content.models import Post

User = get_user_model()
TAG = "[DEMO]"
PW = "CaitechDemo2026!"

def ensure_user(username, email, **flags):
    u, _ = User.objects.get_or_create(username=username, defaults={"email": email, **flags})
    for k, v in flags.items():
        setattr(u, k, v)
    u.email = email
    u.set_password(PW)
    u.save()
    return u

def ensure_cat(name, desc=""):
    from django.utils.text import slugify
    slug = slugify(name)[:50] or "demo-category"
    c, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
    if c.name != name:
        c.name = name
        c.save(update_fields=["name"])
    return c

def ensure_course(slug, **kw):
    c, _ = Course.objects.update_or_create(slug=slug, defaults=kw)
    return c

def ensure_section(course, title, order):
    s, _ = Section.objects.update_or_create(course=course, order=order, defaults={"title": title})
    return s

def ensure_lesson(section, title, order, preview=False, minutes=25):
    l, _ = Lesson.objects.update_or_create(
        section=section, order=order,
        defaults={
            "title": title,
            "course": section.course,
            "is_preview": preview,
            "duration_minutes": minutes,
            "video_url": "",
        },
    )
    return l

class Command(BaseCommand):
    help = "Seed durable CAITECH demo data for QA and client demos."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding demo...")
        student = ensure_user(
            "demo.student", "demo.student@caitech.test",
            first_name="Demo", last_name="Student", is_student=True,
            is_instructor=False, is_verified_instructor=False, is_staff=False, is_superuser=False,
        )
        instructor = ensure_user(
            "demo.instructor", "demo.instructor@caitech.test",
            first_name="Demo", last_name="Instructor", is_student=False,
            is_instructor=True, is_verified_instructor=True, is_staff=False, is_superuser=False,
        )
        ensure_user(
            "demo.admin", "demo.admin@caitech.test",
            first_name="Demo", last_name="Admin", is_student=False,
            is_instructor=True, is_verified_instructor=True, is_staff=True, is_superuser=True,
        )
        cad = ensure_cat(f"{TAG} School of CAD & Technology", "Demo CAD / digital construction school.")
        ictc = ensure_cat(f"{TAG} School of ICT", "Demo ICT school.")
        build = ensure_cat(f"{TAG} School of Building Technology", "Demo building technology school.")
        bim = ensure_course(
            "demo-bim-digital-construction",
            title=f"{TAG} BIM & Digital Construction Practice",
            short_description="Six-module DEMO path from CAD foundations to coordinated BIM documentation.",
            description=(
                "Demo programme for client walkthroughs. Six modular units map CAD foundations through "
                "Revit modelling, coordination and documentation. Labelled DEMO — not official CAITECH curriculum."
            ),
            category=cad, instructor=instructor,
            price=Decimal("45000.00"), original_price=Decimal("52000.00"),
            level=Course.Level.INTERMEDIATE, duration="6 months · 6 modules",
            course_type=Course.CourseType.CERTIFICATE,
            delivery_modes=[Course.DeliveryMode.PHYSICAL, Course.DeliveryMode.ONLINE],
            intake_status=Course.IntakeStatus.ONGOING,
            learning_outcomes=[
                "Produce coordinated BIM models for building elements",
                "Apply CAD drafting standards used in technical practice contexts",
                "Document sheets and schedules for review packages",
                "Collaborate on model exchanges and clash notes",
            ],
            is_published=True,
        )
        mods = [
            ensure_section(bim, "Module 1 — CAD foundations", 1),
            ensure_section(bim, "Module 2 — Architectural modelling in Revit", 2),
            ensure_section(bim, "Module 3 — Structure & documentation", 3),
            ensure_section(bim, "Module 4 — Coordination workflows", 4),
            ensure_section(bim, "Module 5 — Project package", 5),
            ensure_section(bim, "Module 6 — Review & professional practice", 6),
        ]
        lessons = [
            ensure_lesson(mods[0], "Welcome & studio expectations", 1, True, 12),
            ensure_lesson(mods[0], "Drawing standards and layers", 2, True, 28),
            ensure_lesson(mods[0], "2D drafting drills", 3, False, 35),
            ensure_lesson(mods[1], "Revit project setup", 1, False, 30),
            ensure_lesson(mods[1], "Walls, floors and roofs", 2, False, 40),
            ensure_lesson(mods[1], "Views and sheets", 3, False, 32),
            ensure_lesson(mods[2], "Structural grids and levels", 1, False, 30),
            ensure_lesson(mods[2], "Schedules and tags", 2, False, 28),
            ensure_lesson(mods[3], "Model exchange basics", 1, False, 26),
            ensure_lesson(mods[3], "Clash note workflow", 2, False, 30),
            ensure_lesson(mods[4], "Issue set preparation", 1, False, 34),
            ensure_lesson(mods[5], "Portfolio critique checklist", 1, False, 22),
        ]
        quiz, _ = Quiz.objects.update_or_create(
            course=bim, title=f"{TAG} Module 1 knowledge check",
            defaults={"description": "Short demo quiz on CAD standards.", "max_attempts": 3},
        )
        Question.objects.filter(quiz=quiz).delete()
        q1 = Question.objects.create(quiz=quiz, prompt="Which practice keeps CAD files legible across teams?", order=1, points=Decimal("1.00"))
        Choice.objects.create(question=q1, text="Consistent layer naming and standards", is_correct=True, order=1)
        Choice.objects.create(question=q1, text="Random colours on every object", is_correct=False, order=2)
        Choice.objects.create(question=q1, text="Deleting unused standards", is_correct=False, order=3)
        q2 = Question.objects.create(quiz=quiz, prompt="A preview lesson is intended for:", order=2, points=Decimal("1.00"))
        Choice.objects.create(question=q2, text="Prospective learners before full enrolment", is_correct=True, order=1)
        Choice.objects.create(question=q2, text="Staff payroll only", is_correct=False, order=2)
        asg, _ = Assignment.objects.update_or_create(
            course=bim, title=f"{TAG} Drafting standards sheet",
            defaults={
                "description": "Submit a short note describing your layer strategy for a small floor plan. DEMO coursework.",
                "due_at": timezone.now() + timedelta(days=21),
                "max_points": Decimal("100.00"),
            },
        )
        ict = ensure_course(
            "demo-ict-foundations-nairobi",
            title=f"{TAG} ICT Foundations for Technical Careers",
            short_description="DEMO short course on computing literacy, networks and cyber hygiene.",
            description="Demo ICT foundations for technical learners. Labelled DEMO — not official CAITECH prospectus text.",
            category=ictc, instructor=instructor,
            price=Decimal("18000.00"), original_price=Decimal("22000.00"),
            level=Course.Level.BEGINNER, duration="8 weeks · 3 modules",
            course_type=Course.CourseType.SHORT_COURSE,
            delivery_modes=[Course.DeliveryMode.PHYSICAL, Course.DeliveryMode.ONLINE],
            intake_status=Course.IntakeStatus.ONGOING,
            learning_outcomes=["Explain core computing concepts", "Apply safe account practices", "Map a simple small-office network"],
            is_published=True,
        )
        m1 = ensure_section(ict, "Module 1 — Computing literacy", 1)
        m2 = ensure_section(ict, "Module 2 — Networks & security awareness", 2)
        m3 = ensure_section(ict, "Module 3 — Capstone brief", 3)
        ensure_lesson(m1, "Hardware and OS overview", 1, True, 20)
        ensure_lesson(m1, "Files, backups and collaboration", 2, False, 24)
        ensure_lesson(m2, "LAN concepts", 1, False, 26)
        ensure_lesson(m2, "Passwords and account hygiene", 2, False, 22)
        ensure_lesson(m3, "Workplace mini-project brief", 1, False, 18)
        Quiz.objects.update_or_create(course=ict, title=f"{TAG} ICT foundations check", defaults={"description": "Demo ICT quiz.", "max_attempts": 2})
        Assignment.objects.update_or_create(
            course=ict, title=f"{TAG} Security hygiene checklist",
            defaults={"description": "List five account-security habits. DEMO assignment.", "due_at": timezone.now() + timedelta(days=14), "max_points": Decimal("50.00")},
        )
        survey = ensure_course(
            "demo-surveying-intro",
            title=f"{TAG} Introduction to Land Surveying Concepts",
            short_description="Free DEMO intro to surveying vocabulary and field notes.",
            description="Free DEMO introduction to surveying vocabulary and field notes for zero-price enrolment tests. Not official curriculum.",
            category=build, instructor=instructor,
            price=Decimal("0.00"), original_price=None, is_free=True,
            level=Course.Level.BEGINNER, duration="2 weeks · 2 modules",
            course_type=Course.CourseType.SHORT_COURSE,
            delivery_modes=[Course.DeliveryMode.ONLINE],
            intake_status=Course.IntakeStatus.ONGOING,
            learning_outcomes=["Define core surveying terms", "Read a simple site sketch legend"],
            is_published=True,
        )
        sv1 = ensure_section(survey, "Module 1 — Language of the site", 1)
        sv2 = ensure_section(survey, "Module 2 — Notes and sketches", 2)
        ensure_lesson(sv1, "Survey vocabulary", 1, True, 15)
        ensure_lesson(sv1, "Control points (intro)", 2, False, 18)
        ensure_lesson(sv2, "Field notes template", 1, False, 16)
        enr, _ = Enrollment.objects.get_or_create(student=student, course=bim)
        Enrollment.objects.get_or_create(student=student, course=survey)
        for lesson in lessons[:3]:
            LessonProgress.objects.update_or_create(
                enrollment=enr, lesson=lesson,
                defaults={"completed": True, "completed_at": timezone.now()},
            )
        correct = Choice.objects.filter(question=q1, is_correct=True).first()
        QuizAttempt.objects.update_or_create(
            quiz=quiz, student=student, attempt_number=1,
            defaults={
                "answers": [{"question": q1.id, "choices": [correct.id] if correct else []}],
                "score": Decimal("1.00"), "total_points": Decimal("2.00"),
            },
        )
        AssignmentSubmission.objects.update_or_create(
            assignment=asg, student=student,
            defaults={
                "content": "DEMO submission: walls on A-WALL, furniture on A-FURN, annotations on A-ANNO.",
                "grade": None, "feedback": "", "graded_by": None, "graded_at": None,
            },
        )
        CourseReview.objects.update_or_create(
            course=bim, student=student,
            defaults={"rating": 5, "comment": "DEMO review: clear module structure for walkthroughs."},
        )
        Post.objects.update_or_create(
            slug="demo-why-bim-matters-for-technical-learners",
            defaults={
                "title": f"{TAG} Why BIM skills matter for technical learners",
                "excerpt": "Demo editorial on digital construction literacy.",
                "body": "DEMO journal content for platform demonstrations. Replace with real CAITECH editorial when available.",
                "status": Post.Status.PUBLISHED, "published_at": timezone.now(),
            },
        )
        Post.objects.update_or_create(
            slug="demo-cad-to-revit-learning-path",
            defaults={
                "title": f"{TAG} From AutoCAD habits to Revit thinking",
                "excerpt": "Demo note on drafting-to-model workflows.",
                "body": "DEMO content only. Module-based programmes help carry 2D standards into parametric modelling.",
                "status": Post.Status.PUBLISHED, "published_at": timezone.now(),
            },
        )
        self.stdout.write(self.style.SUCCESS("Demo seed complete."))
        self.stdout.write(f"  demo.student@caitech.test / {PW}")
        self.stdout.write(f"  demo.instructor@caitech.test / {PW}")
        self.stdout.write(f"  demo.admin@caitech.test / {PW}")
        self.stdout.write("  Courses: demo-bim-digital-construction, demo-ict-foundations-nairobi, demo-surveying-intro")
        self.stdout.write("  clear_demo is manual-only (--yes required).")
