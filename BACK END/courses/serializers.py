from rest_framework import serializers
from .models import Category, Course, Lesson, Enrollment


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'video_url', 'is_preview', 'order']


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_username = serializers.CharField(source='instructor.username', read_only=True)

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


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_username', 'course', 'course_title', 'enrolled_at', 'completed']
        read_only_fields = ['student', 'enrolled_at', 'completed']