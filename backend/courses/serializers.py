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


class SectionLessonOutlineSerializer(serializers.ModelSerializer):
    """Public curriculum outline — titles/meta only, no gated media."""

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'duration_minutes', 'is_preview']


class SectionSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'lessons']

    @extend_schema_field(SectionLessonOutlineSerializer(many=True))
    def get_lessons(self, section):
        from .permissions import user_can_access_course

        qs = section.lessons.all().order_by('order')
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request is not None else None
        course = section.course
        if not user_can_access_course(user, course):
            qs = qs.filter(is_preview=True)
        return SectionLessonOutlineSerializer(qs, many=True, context=self.context).data

    def validate_order(self, value):
        course = getattr(self.instance, 'course', None) or self.context.get('course')
        sections = Section.objects.filter(course=course, order=value) if course else Section.objects.none()
        if self.instance:
            sections = sections.exclude(pk=self.instance.pk)
        if sections.exists():
            raise serializers.ValidationError('Section order must be unique within a course.')
        return value


class VersionedLessonSerializer(serializers.ModelSerializer):
    """Full lesson payload for detail endpoints (gated media included when authorized)."""

    class Meta:
        model = Lesson
        fields = [
            'id',
            'course',
            'section',
            'title',
            'video_url',
            'order',
            'duration_minutes',
            'is_preview',
        ]
        read_only_fields = ['course']


class VersionedCourseSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    lessons = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    instructor_username = serializers.CharField(source='instructor.username', read_only=True)
    average_rating = serializers.FloatField(read_only=True, allow_null=True, default=None)
    review_count = serializers.IntegerField(read_only=True, default=0)
    enrolled_count = serializers.IntegerField(read_only=True, default=0)
    percent_booked = serializers.SerializerMethodField()
    total_duration_hours = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
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
    image = serializers.ImageField(required=False, allow_empty_file=False)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'description', 'target_audience',
            'learning_outcomes', 'image',
            'category', 'category_name', 'category_slug',
            'instructor', 'instructor_username', 'price', 'original_price',
            'currency', 'seat_capacity', 'level', 'is_published', 'is_free', 'created_at',
            'sections', 'lessons', 'average_rating', 'review_count',
            'enrolled_count', 'percent_booked', 'total_duration_hours',
            'is_available',
            'course_type', 'duration', 'delivery_modes', 'intake_status',
            'whatsapp_inquiry_url',
            'source_id', 'is_official',
        ]
        read_only_fields = [
            'instructor', 'average_rating', 'review_count', 'enrolled_count',
            'percent_booked', 'total_duration_hours',
            'is_available',
            'source_id', 'is_official',
        ]

    def get_percent_booked(self, course):
        enrolled_count = getattr(course, 'enrolled_count', None)
        if enrolled_count is None:
            enrolled_count = course.enrollments.count()
        capacity = course.seat_capacity
        if not capacity:
            return None
        return round(min(100.0, (enrolled_count / capacity) * 100.0), 1)

    def get_total_duration_hours(self, course):
        total_minutes = getattr(course, 'total_duration_minutes', None)
        if total_minutes is None:
            total_minutes = (
                Lesson.objects.filter(course=course).aggregate(total=Sum('duration_minutes'))['total'] or 0
            )
        return round((total_minutes or 0) / 60.0, 1)

    def get_is_available(self, course):
        return course.is_available

    @extend_schema_field(LessonSerializer(many=True))
    def get_lessons(self, course):
        # Flat list kept for older clients; prefer sections for curriculum.
        # Public/unentitled users only see preview lessons (no gated media list).
        from .permissions import user_can_access_course

        qs = course.lessons.all().order_by('section__order', 'order', 'pk')
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request is not None else None
        if not user_can_access_course(user, course):
            qs = qs.filter(is_preview=True)
        return LessonSerializer(qs, many=True, context=self.context).data


class CourseSerializer(VersionedCourseSerializer):
    """Legacy alias used by non-versioned endpoints and nested category payloads."""

    instructor_username = serializers.CharField(source='instructor.username', read_only=True)

    class Meta(VersionedCourseSerializer.Meta):
        fields = [
            'id', 'title', 'slug', 'short_description', 'description', 'target_audience',
            'learning_outcomes', 'image', 'category', 'instructor', 'instructor_username',
            'price', 'is_published', 'is_free', 'created_at', 'lessons',
            'source_id', 'is_official',
        ]
        read_only_fields = ['instructor', 'instructor_username', 'source_id', 'is_official']


class CategorySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'display_order', 'is_official', 'courses',
        ]
        read_only_fields = ['is_official']


class VersionedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'display_order', 'is_official',
        ]
        read_only_fields = ['is_official']


class CourseReviewSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = CourseReview
        fields = [
            'id',
            'course',
            'student',
            'student_username',
            'rating',
            'comment',
            'created_at',
        ]
        read_only_fields = ['student', 'course', 'student_username', 'created_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_order = serializers.IntegerField(source='lesson.order', read_only=True)
    completed_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            'id',
            'lesson',
            'lesson_title',
            'lesson_order',
            'completed',
            'completed_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'lesson_title', 'lesson_order', 'completed_at', 'updated_at']

    def validate_lesson(self, lesson):
        enrollment = self.context.get('enrollment')
        if enrollment is not None and lesson.course_id != enrollment.course_id:
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
    course_id = serializers.IntegerField(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    completed_lessons = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'course_id',
            'course_title',
            'course_slug',
            'enrolled_at',
            'completed',
            'total_lessons',
            'completed_lessons',
            'progress_percentage',
        ]

    def get_progress_percentage(self, enrollment):
        total = getattr(enrollment, 'total_lessons', None)
        completed = getattr(enrollment, 'completed_lessons', None)
        if total is None:
            total = enrollment.course.lessons.count()
        if completed is None:
            completed = enrollment.lesson_progress.filter(completed=True).count()
        if not total:
            return 0
        return round(completed * 100 / total, 2)


class StudentDashboardResponseSerializer(serializers.Serializer):
    my_courses = DashboardEnrollmentSerializer(many=True)
    certificates = serializers.ListField(child=serializers.DictField(), required=False)
    pagination = serializers.DictField()


class CourseResourceSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    # Accept upload on write; never echo the raw storage path in responses.
    file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = CourseResource
        fields = [
            'id',
            'lesson',
            'title',
            'file',
            'order',
            'created_at',
            'download_url',
        ]
        read_only_fields = ['id', 'lesson', 'created_at', 'download_url']
        extra_kwargs = {
            'lesson': {'required': False},
        }

    def get_download_url(self, obj):
        request = self.context.get('request')
        url = reverse('api-v1-resource-download', kwargs={'pk': obj.pk})
        if request is not None:
            return request.build_absolute_uri(url)
        return url


class ResourceErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()


class ManualEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'course',
            'note',
            'enrolled_by',
            'enrolled_at',
            'completed',
        ]
        read_only_fields = ['id', 'enrolled_by', 'enrolled_at', 'completed']


class AdminEnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    enrolled_by_username = serializers.CharField(
        source='enrolled_by.username',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_username',
            'course',
            'course_title',
            'course_slug',
            'enrolled_by',
            'enrolled_by_username',
            'note',
            'enrolled_at',
            'completed',
        ]
        read_only_fields = [
            'id',
            'student_username',
            'course_title',
            'course_slug',
            'enrolled_by',
            'enrolled_by_username',
            'enrolled_at',
            'completed',
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'student',
            'student_username',
            'course',
            'course_title',
            'enrolled_at',
            'completed',
        ]
        read_only_fields = ['student', 'enrolled_at', 'completed']
