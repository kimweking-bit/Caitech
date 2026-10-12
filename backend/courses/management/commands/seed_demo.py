"""Idempotent CAITECH demo dataset — rich, role-separated, presentation-ready.

Re-running creates/updates demo records only. Never wipes the DB.
Manual wipe: manage.py clear_demo --yes
"""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

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
from payments.models import Order, OrderItem, PaymentTransaction
from site_content.models import BlogCategory, ContactInquiry, NewsletterSubscription, Post, Tag

User = get_user_model()
TAG = "[DEMO]"
PWD = "CaitechDemo2026!"


def ensure_user(
    username,
    email,
    first,
    last,
    *,
    student=False,
    instructor=False,
    staff=False,
    superuser=False,
    verified_instructor=False,
    bio="",
):
    """Strict roles: admin never instructor; instructor never staff; student neither."""
    u, _ = User.objects.get_or_create(username=username, defaults={"email": email})
    u.email = email
    u.first_name = first
    u.last_name = last
    u.set_password(PWD)
    u.is_active = True
    if staff:
        u.is_staff = True
        u.is_superuser = bool(superuser)
        u.is_instructor = False
        u.is_verified_instructor = False
        u.is_student = False
    elif instructor:
        u.is_staff = False
        u.is_superuser = False
        u.is_instructor = True
        u.is_verified_instructor = bool(verified_instructor)
        u.is_student = False
    else:
        u.is_staff = False
        u.is_superuser = False
        u.is_instructor = False
        u.is_verified_instructor = False
        u.is_student = True
    if bio and hasattr(u, "bio"):
        u.bio = bio
    u.save()
    return u


def ensure_category(name: str) -> Category:
    slug = slugify(f"demo-{name}")[:50]
    cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": f"{TAG} {name}"})
    if not str(cat.name).startswith(TAG):
        cat.name = f"{TAG} {name}"
        cat.save(update_fields=["name"])
    return cat


def ensure_course(
    *,
    title,
    slug_key,
    category,
    instructor,
    price,
    level,
    course_type,
    duration,
    short,
    description,
    outcomes,
) -> Course:
    slug = slugify(f"demo-{slug_key}")[:50]
    defaults = dict(
        title=f"{TAG} {title}",
        short_description=short[:280],
        description=description,
        learning_outcomes=outcomes,
        category=category,
        instructor=instructor,
        price=Decimal(price),
        original_price=Decimal(price) + Decimal("2500.00"),
        currency=Course.Currency.KES,
        level=level,
        is_published=True,
        is_free=Decimal(price) == 0,
        course_type=course_type,
        duration=duration,
        delivery_modes=["online", "recorded"],
        intake_status=Course.IntakeStatus.ONGOING,
        seat_capacity=80,
    )
    c, created = Course.objects.get_or_create(slug=slug, defaults=defaults)
    if not created:
        for k, v in defaults.items():
            setattr(c, k, v)
        c.save()
    return c


def ensure_section(course, title, order) -> Section:
    sec, _ = Section.objects.get_or_create(
        course=course, title=title, defaults={"order": order}
    )
    if sec.order != order:
        sec.order = order
        sec.save(update_fields=["order"])
    return sec


def ensure_lesson(course, section, title, order, is_preview, minutes) -> Lesson:
    les, _ = Lesson.objects.get_or_create(
        course=course,
        section=section,
        title=title,
        defaults={
            "order": order,
            "is_preview": is_preview,
            "duration_minutes": minutes,
            "video_url": "",
        },
    )
    if les.order != order or les.is_preview != is_preview:
        les.order = order
        les.is_preview = is_preview
        les.duration_minutes = minutes
        les.save()
    return les


def ensure_quiz(course, title, pass_score=70) -> Quiz:
    del pass_score  # model has max_attempts, not pass_score
    q, _ = Quiz.objects.get_or_create(
        course=course,
        title=title,
        defaults={
            "description": f"{TAG} Knowledge check.",
            "max_attempts": 3,
        },
    )
    if q.questions.count() < 3:
        for i in range(1, 4):
            qq, _ = Question.objects.get_or_create(
                quiz=q,
                order=i,
                defaults={
                    "prompt": f"{TAG} Question {i} — {title}?",
                    "points": Decimal("1.00"),
                },
            )
            if qq.choices.count() < 3:
                for j, label in enumerate(["Option A", "Option B", "Option C"], start=1):
                    Choice.objects.get_or_create(
                        question=qq,
                        order=j,
                        defaults={"text": label, "is_correct": j == 1},
                    )
    return q


def ensure_assignment(course, title, days_offset) -> Assignment:
    due = timezone.now() + timedelta(days=days_offset)
    a, created = Assignment.objects.get_or_create(
        course=course,
        title=title,
        defaults={
            "description": f"{TAG} Practical work for {title}.",
            "due_at": due,
            "max_points": Decimal("100.00"),
        },
    )
    if not created and a.due_at is None:
        a.due_at = due
        a.save(update_fields=["due_at"])
    return a


def ensure_enrollment(student, course, *, completed=False) -> Enrollment:
    en, _ = Enrollment.objects.get_or_create(
        student=student,
        course=course,
        defaults={"completed": completed, "note": TAG},
    )
    updates = []
    if en.completed != completed:
        en.completed = completed
        updates.append("completed")
    if en.note != TAG:
        en.note = TAG
        updates.append("note")
    if updates:
        en.save(update_fields=updates)
    return en


def mark_lessons(enrollment, ratio: float) -> None:
    lessons = list(
        Lesson.objects.filter(course=enrollment.course).order_by(
            "section__order", "order", "pk"
        )
    )
    if not lessons:
        return
    n = max(0, min(len(lessons), int(round(len(lessons) * max(0.0, min(1.0, ratio))))))
    for les in lessons[:n]:
        LessonProgress.objects.update_or_create(
            enrollment=enrollment,
            lesson=les,
            defaults={"completed": True, "completed_at": timezone.now() - timedelta(days=1)},
        )
    if ratio >= 0.99 and not enrollment.completed:
        enrollment.completed = True
        enrollment.save(update_fields=["completed"])


def _order_item(order, course):
    OrderItem.objects.get_or_create(
        order=order,
        course=course,
        defaults={
            "course_title": course.title,
            "unit_price": course.price,
            "original_unit_price": course.original_price or course.price,
            "currency": "KES",
            "quantity": 1,
        },
    )


def _payment(order, course, *, provider, status, ref):
    PaymentTransaction.objects.get_or_create(
        order=order,
        defaults={
            "provider": provider,
            "status": status,
            "amount": course.price,
            "currency": "KES",
            "provider_reference": ref,
        },
    )


def _make_order(student, course, status, **extra) -> Order:
    existing = (
        Order.objects.filter(user=student, items__course=course, status=status)
        .order_by("-pk")
        .first()
    )
    if existing:
        return existing
    order = Order.objects.create(
        user=student,
        status=status,
        currency="KES",
        customer_name=student.get_full_name() or student.username,
        customer_email=student.email or "",
        subtotal=course.price,
        discount_amount=Decimal("0.00"),
        fee_amount=Decimal("0.00"),
        total=course.price,
        **extra,
    )
    _order_item(order, course)
    return order


def ensure_paid_order(student, course, *, days_ago=10) -> Order:
    order = _make_order(student, course, Order.Status.PAID)
    _payment(
        order,
        course,
        provider=PaymentTransaction.Provider.CARD,
        status=PaymentTransaction.Status.CONFIRMED,
        ref=f"DEMO-PAY-{order.pk}",
    )
    return order


def ensure_pending_order(student, course) -> Order:
    order = _make_order(
        student,
        course,
        Order.Status.PENDING,
        expires_at=timezone.now() + timedelta(hours=12),
    )
    _payment(
        order,
        course,
        provider=PaymentTransaction.Provider.MPESA,
        status=PaymentTransaction.Status.PENDING,
        ref=f"DEMO-PEND-{order.pk}",
    )
    return order


def ensure_failed_order(student, course) -> Order:
    order = _make_order(student, course, Order.Status.FAILED)
    _payment(
        order,
        course,
        provider=PaymentTransaction.Provider.MPESA,
        status=PaymentTransaction.Status.FAILED,
        ref=f"DEMO-FAIL-{order.pk}",
    )
    return order


class Command(BaseCommand):
    help = "Seed rich, idempotent CAITECH demo data with strict role separation."

    def handle(self, *args, **options):
        # SQLite: allow waiting if runserver holds a brief lock
        from django.db import connection

        with connection.cursor() as cursor:
            try:
                cursor.execute("PRAGMA busy_timeout = 60000")
            except Exception:
                pass

        self.stdout.write("Seeding rich CAITECH demo dataset…")

        student_primary = ensure_user(
            "demo.student",
            "demo.student@caitech.test",
            "Amina",
            "Wanjiku",
            student=True,
            bio="Demo student — learning portal only.",
        )
        instructor_primary = ensure_user(
            "demo.instructor",
            "demo.instructor@caitech.test",
            "James",
            "Ochieng",
            instructor=True,
            verified_instructor=True,
            bio="Demo instructor — teaching only. NOT staff.",
        )
        ensure_user(
            "demo.admin",
            "demo.admin@caitech.test",
            "Grace",
            "Mutua",
            staff=True,
            superuser=True,
            bio="Demo admin — operations only. NOT instructor.",
        )

        instructor_specs = [
            ("demo.inst.bim", "Daniel", "Kariuki", "BIM / Revit"),
            ("demo.inst.cad", "Sarah", "Njeri", "CAD"),
            ("demo.inst.civil", "Peter", "Otieno", "Civil / Survey"),
            ("demo.inst.ict", "Faith", "Achieng", "ICT / Cyber"),
            ("demo.inst.data", "Brian", "Mwangi", "Data"),
            ("demo.inst.design", "Lucy", "Wambui", "Design"),
            ("demo.inst.pm", "Samuel", "Kiptoo", "PM"),
        ]
        instructors = [instructor_primary]
        for uname, fn, ln, specialty in instructor_specs:
            instructors.append(
                ensure_user(
                    uname,
                    f"{uname}@caitech.test",
                    fn,
                    ln,
                    instructor=True,
                    verified_instructor=True,
                    bio=f"{TAG} Specialty: {specialty}",
                )
            )

        cats = {
            "bim": ensure_category("BIM & Construction Tech"),
            "cad": ensure_category("CAD & Drafting"),
            "survey": ensure_category("Surveying & QS"),
            "ict": ensure_category("ICT & Cybersecurity"),
            "data": ensure_category("Data & Programming"),
            "design": ensure_category("Architecture & Design"),
            "pm": ensure_category("Project & Building Tech"),
        }

        defs = [
            ("BIM & Digital Construction Practice", "bim-digital", "bim", 0, "18500.00", "intermediate", "certificate", "8 weeks"),
            ("Revit Architecture Fundamentals", "revit-arch", "bim", 1, "16500.00", "beginner", "certificate", "6 weeks"),
            ("AutoCAD & CAD Fundamentals", "autocad-fundamentals", "cad", 2, "12000.00", "beginner", "short_course", "4 weeks"),
            ("Civil 3D Fundamentals", "civil-3d", "survey", 3, "19500.00", "intermediate", "certificate", "8 weeks"),
            ("Land Surveying Practice", "land-surveying", "survey", 3, "15000.00", "beginner", "certificate", "6 weeks"),
            ("Quantity Surveying Essentials", "quantity-surveying", "survey", 0, "14000.00", "intermediate", "certificate", "6 weeks"),
            ("ICT Foundations", "ict-foundations", "ict", 4, "9000.00", "beginner", "short_course", "4 weeks"),
            ("Cybersecurity Fundamentals", "cybersecurity-fundamentals", "ict", 4, "16000.00", "intermediate", "certificate", "6 weeks"),
            ("Data Science Foundations", "data-science-foundations", "data", 5, "17500.00", "beginner", "certificate", "8 weeks"),
            ("Computer Programming Basics", "programming-basics", "data", 5, "11000.00", "beginner", "short_course", "5 weeks"),
            ("Interior Design Studio Intro", "interior-design", "design", 6, "13000.00", "beginner", "certificate", "6 weeks"),
            ("Architecture Technology Overview", "architecture-tech", "design", 6, "14500.00", "intermediate", "diploma", "10 weeks"),
            ("Building Technology Practice", "building-technology", "pm", 7, "12500.00", "intermediate", "certificate", "6 weeks"),
            ("Construction Project Management", "construction-pm", "pm", 7, "20000.00", "advanced", "certificate", "8 weeks"),
        ]

        courses = []
        for title, slug, cat_key, ii, price, level, ctype, dur in defs:
            inst = instructors[ii]
            c = ensure_course(
                title=title,
                slug_key=slug,
                category=cats[cat_key],
                instructor=inst,
                price=price,
                level=level,
                course_type=ctype,
                duration=dur,
                short=f"Professional skills in {title} for technical teams.",
                description=(
                    f"{TAG} {title}. Led by {inst.get_full_name() or inst.username}. "
                    "Includes modules, lessons, quizzes, and graded assignments."
                ),
                outcomes=[
                    f"Apply core methods in {title}",
                    "Produce portfolio-ready outputs",
                    "Follow professional documentation standards",
                ],
            )
            courses.append(c)

            s1 = ensure_section(c, "Foundations", 1)
            s2 = ensure_section(c, "Applied practice", 2)
            s3 = ensure_section(c, "Delivery & review", 3)
            ensure_lesson(c, s1, f"Introduction to {title}", 1, True, 18)
            ensure_lesson(c, s1, "Standards and workspace setup", 2, False, 22)
            ensure_lesson(c, s1, "Core concepts lab", 3, False, 30)
            ensure_lesson(c, s2, "Workflow studio", 1, False, 35)
            ensure_lesson(c, s2, "Case study walkthrough", 2, False, 28)
            ensure_lesson(c, s2, "Quality checks", 3, False, 25)
            ensure_lesson(c, s3, "Project packaging", 1, False, 32)
            ensure_lesson(c, s3, "Review board", 2, False, 20)
            ensure_lesson(c, s3, "Capstone briefing", 3, False, 40)
            ensure_quiz(c, f"{title} — Module quiz")
            ensure_quiz(c, f"{title} — Final check")
            ensure_assignment(c, f"{title} — Practical A", 5)
            ensure_assignment(c, f"{title} — Practical B", 12)
            ensure_assignment(c, f"{title} — Capstone", -3)

        firsts = [
            "Amina", "Brian", "Cynthia", "David", "Esther", "Felix", "Grace", "Hassan",
            "Irene", "Joseph", "Karen", "Leo", "Mary", "Nathan", "Olive", "Paul",
            "Queenie", "Robert", "Susan", "Tom", "Ursula", "Victor", "Winnie", "Xavier",
            "Yvonne", "Zuri", "Abdi", "Beatrice", "Collins", "Diana", "Elijah", "Fiona",
            "George", "Helen", "Ian", "Joyce", "Kevin", "Lydia", "Michael",
        ]
        lasts = [
            "Otieno", "Wanjiru", "Kamau", "Achieng", "Njoroge", "Mwangi", "Omondi", "Cheruiyot",
            "Mutiso", "Wekesa", "Nyambura", "Kiprop", "Moraa", "Odhiambo", "Wambua", "Kariuki",
        ]
        students = [student_primary]
        for i in range(1, 40):
            uname = f"demo.student.{i:02d}"
            students.append(
                ensure_user(
                    uname,
                    f"{uname}@caitech.test",
                    firsts[i % len(firsts)],
                    lasts[i % len(lasts)],
                    student=True,
                    bio=f"{TAG} Cohort student #{i:02d}",
                )
            )

        ratios = [0.05, 0.15, 0.28, 0.42, 0.55, 0.68, 0.82, 0.95, 1.0, 0.0, 0.35, 0.7, 0.88, 0.12, 0.48]

        for si, st in enumerate(students):
            n_courses = 1 + (si % 3)
            picks = [courses[(si + k * 3) % len(courses)] for k in range(n_courses)]
            for pi, course in enumerate(picks):
                ratio = ratios[(si + pi) % len(ratios)]
                en = ensure_enrollment(st, course, completed=ratio >= 0.99)
                mark_lessons(en, ratio)

                if ratio >= 0.6 and (si + pi) % 2 == 0:
                    CourseReview.objects.update_or_create(
                        course=course,
                        student=st,
                        defaults={
                            "rating": 3 + ((si + pi) % 3),
                            "comment": f"{TAG} Practical and well paced — {course.title}.",
                        },
                    )

                roll = (si + pi) % 5
                if roll in (0, 3):
                    ensure_paid_order(st, course, days_ago=8 + (si % 15))
                elif roll == 1:
                    ensure_pending_order(st, course)
                elif roll == 2:
                    ensure_failed_order(st, course)

        for course in courses:
            assignments = list(Assignment.objects.filter(course=course).order_by("pk"))
            quizzes = list(Quiz.objects.filter(course=course).order_by("pk"))
            enrolled = list(
                Enrollment.objects.filter(course=course).select_related("student")[:14]
            )
            for ei, en in enumerate(enrolled):
                st = en.student
                if not assignments:
                    continue
                a = assignments[ei % len(assignments)]
                mode = ei % 5
                if mode == 0:
                    continue
                payload = {
                    "content": f"{TAG} Work for {a.title} (mode {mode}).",
                    "grade": None,
                    "feedback": "",
                }
                if mode == 3:
                    payload["grade"] = Decimal("72.00") + Decimal(ei % 18)
                    payload["feedback"] = "Clear structure. Strengthen detailing next time."
                elif mode == 4:
                    payload["grade"] = Decimal("58.00")
                    payload["feedback"] = "Accepted late — improve completeness."
                AssignmentSubmission.objects.update_or_create(
                    assignment=a, student=st, defaults=payload
                )
                if quizzes:
                    qz = quizzes[0]
                    sc = Decimal(str(1 + (ei % 3)))
                    # Unique on quiz+student+attempt_number if present
                    defaults = {
                        "score": sc,
                        "total_points": Decimal("3.00"),
                    }
                    # answers field if exists
                    try:
                        QuizAttempt._meta.get_field("answers")
                        defaults["answers"] = []
                    except Exception:
                        pass
                    try:
                        QuizAttempt.objects.update_or_create(
                            quiz=qz,
                            student=st,
                            attempt_number=1,
                            defaults=defaults,
                        )
                    except Exception:
                        QuizAttempt.objects.get_or_create(
                            quiz=qz, student=st, defaults=defaults
                        )

        for c, ratio in [(courses[0], 0.72), (courses[2], 0.35), (courses[7], 0.12)]:
            en = ensure_enrollment(student_primary, c, completed=False)
            mark_lessons(en, ratio)
            ensure_paid_order(student_primary, c)

        for i in range(8):
            ContactInquiry.objects.get_or_create(
                email=f"demo.inquiry.{i:02d}@example.test",
                defaults={
                    "name": f"Demo Inquirer {i + 1}",
                    "phone": f"+25470000{i:04d}",
                    "message": f"{TAG} Interested in intake, fees, and schedule (case {i + 1}).",
                    "course": courses[i % len(courses)],
                },
            )

        for i in range(15):
            NewsletterSubscription.objects.get_or_create(
                email=f"demo.news.{i:02d}@example.test"
            )

        bcat, _ = BlogCategory.objects.get_or_create(
            slug="demo-insights", defaults={"name": f"{TAG} Insights"}
        )
        tag, _ = Tag.objects.get_or_create(slug="demo-tag", defaults={"name": f"{TAG} Tag"})
        for i, title in enumerate(
            [
                "Getting started with BIM coordination",
                "Why CAD standards matter on site",
                "Survey workflows for growing teams",
                "Cyber hygiene for technical institutes",
                "Building a learner portfolio in 30 days",
            ],
            start=1,
        ):
            slug = slugify(f"demo-post-{i}-{title}")[:50]
            post_defaults = {
                "title": f"{TAG} {title}",
                "excerpt": f"Demo article on {title}.",
                "body": f"<p>{TAG} Editorial body for {title}. Demonstration only.</p>",
                "status": Post.Status.PUBLISHED,
                "published_at": timezone.now() - timedelta(days=i * 3),
            }
            post, created = Post.objects.get_or_create(slug=slug, defaults=post_defaults)
            if created:
                try:
                    post.categories.add(bcat)
                except Exception:
                    pass
                try:
                    post.tags.add(tag)
                except Exception:
                    pass

        n_users = User.objects.filter(username__startswith="demo.").count()
        n_courses = Course.objects.filter(slug__startswith="demo-").count()
        n_enroll = Enrollment.objects.filter(course__slug__startswith="demo-").count()
        n_asg = Assignment.objects.filter(course__slug__startswith="demo-").count()
        n_quiz = Quiz.objects.filter(course__slug__startswith="demo-").count()
        n_sub = AssignmentSubmission.objects.filter(
            assignment__course__slug__startswith="demo-"
        ).count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo ready. users={n_users} courses={n_courses} enrollments={n_enroll} "
                f"assignments={n_asg} quizzes={n_quiz} submissions={n_sub}"
            )
        )
        self.stdout.write(
            "Logins (CaitechDemo2026!): demo.student | demo.instructor | demo.admin"
        )
        self.stdout.write(
            "Roles: student=learning only · instructor=teaching only (not staff) · "
            "admin=operations only (not instructor)."
        )
