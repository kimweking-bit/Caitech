from django.conf import settings
from django.db import models
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Course(models.Model):
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
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
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