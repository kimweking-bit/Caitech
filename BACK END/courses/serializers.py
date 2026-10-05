from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.reverse import reverse
from drf_spectacular.utils import extend_schema_field
from django.db.models import Sum
from .models import (
    Category,
    Course,
    CourseResource,
    CourseReview,
    Enrollment,
    Lesson,
    LessonProgress,
    Section,
)

User = get_user_model()


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'video_url', 'is_preview', 'order']


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'title', 'order']

    def validate_order(self, value):
        course = getattr(self.instance, 'course', None) or self.context.get('course')
        sections = Section.objects.filter(course=course, order=value) if course else Section.objects.none()
        if self.instance:
            sections = sections.exclude(pk=self.instance.pk)
        if sections.exists():
            raise serializers.ValidationError('Section order must be unique within a course.')
        return value


class VersionedCourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    lessons = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_username = serializers.CharField(source='instructor.username', read_only=True)
    average_rating = serializers.FloatField(read_only=True, allow_null=True, default=None)
    review_count = serializers.IntegerField(read_only=True, default=0)
    enrolled_count = serializers.IntegerField(read_only=True, default=0)
    percent_booked = serializers.SerializerMethodField()
    total_duration_hours = serializers.SerializerMethodField()
    course_type = serializers.ChoiceField(
        choices=Course.CourseType.choices,
        required=False,
        allow_blank=True,
    )
    duration = serializers.CharField(required=False, allow_blank=True)
    delivery_modes = serializers.ListField(
        child=serializers.ChoiceField(choices=Course.DeliveryMode.choices),
        required=False,
    )
    intake_status = serializers.ChoiceField(
        choices=Course.IntakeStatus.choices,
        required=False,
        allow_blank=True,
    )
    whatsapp_inquiry_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'category_name',
            'instructor', 'instructor_username', 'price', 'original_price',
            'currency', 'seat_capacity', 'is_free', 'created_at',
            'sections', 'lessons', 'average_rating', 'review_count',
            'enrolled_count', 'percent_booked', 'total_duration_hours',
            'course_type', 'duration', 'delivery_modes', 'intake_status',
            'whatsapp_inquiry_url',
        ]
        read_only_fields = [
            'instructor', 'average_rating', 'review_count', 'enrolled_count',
            'percent_booked', 'total_duration_hours',
        ]

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_percent_booked(self, course):
        if not course.seat_capacity:
            return None
        enrolled_count = getattr(course, 'enrolled_count', None)
        if enrolled_count is None:
            enrolled_count = course.enrollments.count()
        return round(enrolled_count * 100 / course.seat_capacity, 2)

    @extend_schema_field(serializers.FloatField())
    def get_total_duration_hours(self, course):
        total_minutes = getattr(course, 'total_duration_minutes', None)
        if total_minutes is None:
            total_minutes = course.lessons.aggregate(total=Sum('duration_minutes'))['total']
        return round((total_minutes or 0) / 60, 2)

    @extend_schema_field(LessonSerializer(many=True))
    def get_lessons(self, course):
        request = self.context.get('request')
        user = request.user if request else None
        has_full_access = bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or course.instructor_id == user.pk
                or course.enrollments.filter(student_id=user.pk).exists()
            )
        )
        lessons = course.lessons.all()
        if not has_full_access:
            lessons = lessons.filter(is_preview=True)
        return LessonSerializer(lessons, many=True, context=self.context).data


class VersionedLessonSerializer(serializers.ModelSerializer):
    section = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'video_url', 'is_preview', 'order', 'section', 'duration_minutes']


class CourseResourceSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseResource
        fields = ['id', 'title', 'order', 'file', 'download_url', 'created_at']
        read_only_fields = ['id', 'download_url', 'created_at']

    @extend_schema_field(serializers.URLField())
    def get_download_url(self, resource):
        return reverse(
            'api-v1-resource-download',
            kwargs={'pk': resource.pk},
            request=self.context.get('request'),
        )


class CourseSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_username = serializers.CharField(source='instructor.username', read_only=True)

    @extend_schema_field(LessonSerializer(many=True))
    def get_lessons(self, course):
        request = self.context.get('request')
        user = request.user if request else None
        has_full_access = bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or course.instructor_id == user.pk
                or course.enrollments.filter(student_id=user.pk).exists()
            )
        )
        lessons = course.lessons.all()
        if not has_full_access:
            lessons = lessons.filter(is_preview=True)
        return LessonSerializer(lessons, many=True, context=self.context).data

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description',
            'category', 'category_name',
            'instructor', 'instructor_username',
            'price', 'is_free', 'created_at', 'lessons'
        ]
        read_only_fields = ['instructor']


class CategorySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'courses']


class VersionedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_order = serializers.IntegerField(source='lesson.order', read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'lesson_title', 'lesson_order', 'completed',
            'completed_at', 'updated_at',
        ]
        read_only_fields = ['id', 'lesson_title', 'lesson_order', 'completed_at', 'updated_at']

    def validate_lesson(self, lesson):
        enrollment = self.context['enrollment']
        if lesson.course_id != enrollment.course_id:
            raise serializers.ValidationError('Lesson must belong to the enrolled course.')
        return lesson


class EnrollmentProgressResponseSerializer(serializers.Serializer):
    enrollment_id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    progress_percentage = serializers.FloatField()
    lessons = LessonProgressSerializer(many=True)


class DashboardEnrollmentSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.SlugField(source='course.slug', read_only=True)
    completed_lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            'id', 'course_id', 'course_title', 'course_slug', 'enrolled_at',
            'completed', 'completed_lessons', 'total_lessons', 'progress_percentage',
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_total_lessons(self, enrollment):
        return enrollment.course.lessons.count()

    @extend_schema_field(serializers.IntegerField())
    def get_completed_lessons(self, enrollment):
        return enrollment.lesson_progress.filter(completed=True).count()

    @extend_schema_field(serializers.FloatField())
    def get_progress_percentage(self, enrollment):
        total = self.get_total_lessons(enrollment)
        if total == 0:
            return 0
        completed = self.get_completed_lessons(enrollment)
        return round(completed * 100 / total, 2)


class DashboardPaginationSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)


class StudentDashboardResponseSerializer(serializers.Serializer):
    my_courses = DashboardEnrollmentSerializer(many=True)
    certificates = serializers.ListField(child=serializers.DictField())
    pagination = DashboardPaginationSerializer()


class ResourceErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()


class CourseReviewSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'student_username', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'student_username', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class ManualEnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    enrolled_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'enrolled_by', 'note', 'enrolled_at', 'completed'
        ]
        read_only_fields = ['id', 'enrolled_by', 'enrolled_at', 'completed']


class AdminEnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    enrolled_by_username = serializers.CharField(source='enrolled_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_username', 'course', 'course_title', 'course_slug',
            'enrolled_by', 'enrolled_by_username', 'note', 'enrolled_at', 'completed'
        ]
        read_only_fields = ['id', 'enrolled_at', 'completed']


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_username', 'course', 'course_title', 'enrolled_at', 'completed']
        read_only_fields = ['student', 'enrolled_at', 'completed']