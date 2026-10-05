from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from accounts.services import send_notification_email
from payments.models import Order, OrderItem

from .models import Category, Course, Lesson, Enrollment
from .serializers import CategorySerializer, CourseSerializer, LessonSerializer, EnrollmentSerializer
from .permissions import CanAccessLesson, IsVerifiedInstructor


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.select_related('category', 'instructor')
        user = self.request.user
        if user.is_staff:
            return queryset
        visible_courses = Q(is_published=True)
        if user.is_authenticated and getattr(user, 'is_verified_instructor', False):
            visible_courses |= Q(instructor_id=user.pk)
        return queryset.filter(visible_courses)


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Course.objects.select_related('category', 'instructor')
        user = self.request.user
        if user.is_staff:
            return queryset
        visible_courses = Q(is_published=True)
        if user.is_authenticated and getattr(user, 'is_verified_instructor', False):
            visible_courses |= Q(instructor_id=user.pk)
        return queryset.filter(visible_courses)


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
                locked_course = Course.objects.select_for_update().get(pk=course.pk)
                if not locked_course.is_published or locked_course.intake_status == Course.IntakeStatus.CLOSED:
                    raise ValidationError({'detail': 'This course is not currently available.'})
                if locked_course.seat_capacity is not None:
                    reserved = OrderItem.objects.filter(
                        course=locked_course,
                        order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
                        order__expires_at__gt=timezone.now(),
                    ).count()
                    if locked_course.enrollments.count() + reserved >= locked_course.seat_capacity:
                        raise ValidationError({'detail': 'This course has no seats available.'})
                enrollment = serializer.save(student=self.request.user, course=locked_course)
        except IntegrityError as exc:
            raise ValidationError(error) from exc

        send_notification_email(
            'enrolment',
            self.request.user.email,
            'Enrollment confirmed',
            (
                f'Hello {self.request.user.username},\n\n'
                f'You have been successfully enrolled in {enrollment.course.title}.\n'
                'Your course access is now active.'
            ),
            related_user=self.request.user,
        )


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)
