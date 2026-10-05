from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Course(models.Model):
    class Currency(models.TextChoices):
        KES = 'KES', 'Kenyan Shilling'
        USD = 'USD', 'US Dollar'

    class CourseType(models.TextChoices):
        DIPLOMA = 'diploma', 'Diploma'
        CERTIFICATE = 'certificate', 'Certificate'
        SHORT_COURSE = 'short_course', 'Short course'

    class DeliveryMode(models.TextChoices):
        ONLINE = 'online', 'Online'
        PHYSICAL = 'physical', 'Physical'
        RECORDED = 'recorded', 'Recorded'

    class IntakeStatus(models.TextChoices):
        ONGOING = 'ongoing', 'Ongoing'
        UPCOMING = 'upcoming', 'Upcoming'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught',
        limit_choices_to={'is_verified_instructor': True},
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
    )
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
    )
    currency = models.CharField(max_length=3, choices=Currency.choices, default=Currency.KES)
    seat_capacity = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
    )
    is_free = models.BooleanField(default=False)
    course_type = models.CharField(
        max_length=20,
        choices=CourseType.choices,
        blank=True,
        default='',
    )
    duration = models.CharField(max_length=100, blank=True)
    delivery_modes = models.JSONField(default=list, blank=True)
    intake_status = models.CharField(
        max_length=20,
        choices=IntakeStatus.choices,
        blank=True,
        default='',
    )
    whatsapp_inquiry_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'pk']
        constraints = [
            models.UniqueConstraint(
                fields=['course', 'order'],
                name='unique_section_order_per_course',
            ),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='lessons',
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=200)
    video_url = models.URLField(blank=True, null=True)
    is_preview = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['section__order', 'order', 'pk']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseResource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='course_resources/%Y/%m/')
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'pk']

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolments_created',
    )
    note = models.TextField(blank=True, default='')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} -> {self.course}"


class LessonProgress(models.Model):
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lesson_progress',
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='enrollment_progress',
    )
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson__section__order', 'lesson__order', 'lesson_id']
        constraints = [
            models.UniqueConstraint(
                fields=['enrollment', 'lesson'],
                name='unique_progress_per_enrollment_lesson',
            ),
        ]

    def save(self, *args, **kwargs):
        if self.completed:
            self.completed_at = self.completed_at or timezone.now()
        else:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.enrollment} - {self.lesson}"


class CourseReview(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='course_reviews',
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True, max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at', '-pk']
        constraints = [
            models.UniqueConstraint(
                fields=['course', 'student'],
                name='unique_review_per_course_student',
            ),
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name='course_review_rating_between_1_and_5',
            ),
        ]

    def __str__(self):
        return f"{self.student} - {self.course} ({self.rating}/5)"


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    max_attempts = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at', 'pk']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    prompt = models.TextField()
    order = models.PositiveIntegerField(default=1)
    points = models.DecimalField(max_digits=7, decimal_places=2, default=1)
    allow_multiple = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', 'pk']
        constraints = [
            models.UniqueConstraint(fields=['quiz', 'order'], name='unique_question_order_per_quiz'),
            models.CheckConstraint(condition=models.Q(points__gt=0), name='question_points_must_be_positive'),
        ]

    def __str__(self):
        return f"{self.quiz.title} - Question {self.order}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=1000)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'pk']
        constraints = [
            models.UniqueConstraint(fields=['question', 'order'], name='unique_choice_order_per_question'),
        ]

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
    )
    attempt_number = models.PositiveSmallIntegerField()
    answers = models.JSONField(default=list)
    score = models.DecimalField(max_digits=9, decimal_places=2)
    total_points = models.DecimalField(max_digits=9, decimal_places=2)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at', '-pk']
        constraints = [
            models.UniqueConstraint(
                fields=['quiz', 'student', 'attempt_number'],
                name='unique_quiz_attempt_number_per_student',
            ),
        ]

    def __str__(self):
        return f"{self.student} - {self.quiz} ({self.score}/{self.total_points})"


class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_at = models.DateTimeField(blank=True, null=True)
    max_points = models.DecimalField(max_digits=7, decimal_places=2, default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_at', 'created_at', 'pk']
        constraints = [
            models.CheckConstraint(condition=models.Q(max_points__gt=0), name='assignment_max_points_must_be_positive'),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignment_submissions',
    )
    content = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='graded_assignment_submissions',
        blank=True,
        null=True,
    )
    graded_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['submitted_at', 'pk']
        constraints = [
            models.UniqueConstraint(
                fields=['assignment', 'student'],
                name='unique_submission_per_assignment_student',
            ),
            models.CheckConstraint(
                condition=models.Q(grade__isnull=True) | models.Q(grade__gte=0),
                name='assignment_submission_grade_nonnegative',
            ),
        ]

    def __str__(self):
        return f"{self.student} - {self.assignment}"