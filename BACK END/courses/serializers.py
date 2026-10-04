from rest_framework import serializers
from rest_framework.reverse import reverse
from .models import Category, Course, CourseResource, Enrollment, Lesson, Section


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

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'category_name',
            'instructor', 'instructor_username', 'price', 'is_free', 'created_at',
            'sections', 'lessons',
        ]
        read_only_fields = ['instructor']

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
        fields = ['id', 'title', 'video_url', 'is_preview', 'order', 'section']


class CourseResourceSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseResource
        fields = ['id', 'title', 'order', 'file', 'download_url', 'created_at']
        read_only_fields = ['id', 'download_url', 'created_at']

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


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_username', 'course', 'course_title', 'enrolled_at', 'completed']
        read_only_fields = ['student', 'enrolled_at', 'completed']