from django.db import IntegrityError, transaction
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Category, Course, Lesson, Enrollment
from .serializers import CategorySerializer, CourseSerializer, LessonSerializer, EnrollmentSerializer
from .permissions import CanAccessLesson, IsVerifiedInstructor


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'slug'


class CourseCreateView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsVerifiedInstructor]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class LessonDetailView(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [CanAccessLesson]


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        error = {'detail': 'You are already enrolled in this course.'}
        if Enrollment.objects.filter(student=self.request.user, course=course).exists():
            raise ValidationError(error)
        if not course.is_free or course.price > 0:
            raise ValidationError({'detail': 'Payment is required before enrolling in this course.'})

        try:
            with transaction.atomic():
                serializer.save(student=self.request.user)
        except IntegrityError as exc:
            raise ValidationError(error) from exc


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)
