from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.db import IntegrityError, transaction
from django.db.models import Avg, Count, Q, TextField
from django.db.models.functions import Cast
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .permissions import (
    CanReadLessonAndManageOwner,
    CanReadResourceAndManageOwner,
    IsReviewOwnerOrAdmin,
    IsAdminOrReadOnly,
    IsCourseOwnerOrStaffOrReadOnly,
    user_can_access_course,
    user_can_manage_course,
)
from .serializers import (
    CourseResourceSerializer,
    CourseReviewSerializer,
    DashboardEnrollmentSerializer,
    LessonProgressSerializer,
    SectionSerializer,
    VersionedCategorySerializer,
    VersionedCourseSerializer,
    VersionedLessonSerializer,
)


class CourseApiPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryListCreateV1(generics.ListCreateAPIView):
    queryset = Category.objects.order_by('name', 'pk')
    serializer_class = VersionedCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = CourseApiPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['name', 'slug']
    ordering = ['name', 'pk']


class CategoryDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = VersionedCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'


class CourseCatalogV1(generics.ListCreateAPIView):
    serializer_class = VersionedCourseSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]
    pagination_class = CourseApiPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name', 'instructor__username']
    ordering_fields = ['title', 'price', 'created_at']
    ordering = ['-created_at', '-pk']

    def get_queryset(self):
        queryset = Course.objects.select_related('category', 'instructor').prefetch_related(
            'lessons', 'sections'
        ).annotate(
            average_rating=Avg('reviews__rating'),
            review_count=Count('reviews', distinct=True),
        )
        params = self.request.query_params
        category = params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        course_type = params.get('course_type')
        if course_type:
            if course_type not in Course.CourseType.values:
                raise ValidationError({'course_type': 'Choose a valid course type.'})
            queryset = queryset.filter(course_type=course_type)

        delivery_mode = params.get('delivery_mode')
        if delivery_mode:
            if delivery_mode not in Course.DeliveryMode.values:
                raise ValidationError({'delivery_mode': 'Choose a valid delivery mode.'})
            queryset = queryset.annotate(
                delivery_modes_text=Cast('delivery_modes', output_field=TextField())
            ).filter(delivery_modes_text__icontains=f'"{delivery_mode}"')

        is_free = params.get('is_free')
        if is_free is not None:
            normalized = is_free.lower()
            if normalized not in {'true', 'false'}:
                raise ValidationError({'is_free': 'Use true or false.'})
            queryset = queryset.filter(is_free=normalized == 'true')

        for parameter, lookup in (
            ('min_price', 'price__gte'),
            ('max_price', 'price__lte'),
        ):
            raw_value = params.get(parameter)
            if raw_value is not None:
                try:
                    value = Decimal(raw_value)
                except (InvalidOperation, ValueError):
                    raise ValidationError({parameter: 'Enter a valid price.'})
                if value < 0:
                    raise ValidationError({parameter: 'Price cannot be negative.'})
                queryset = queryset.filter(**{lookup: value})

        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related('category', 'instructor').prefetch_related(
        'lessons', 'sections'
    ).annotate(
        average_rating=Avg('reviews__rating'),
        review_count=Count('reviews', distinct=True),
    )
    serializer_class = VersionedCourseSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]
    lookup_field = 'slug'


class CourseSectionsV1(generics.ListCreateAPIView):
    serializer_class = SectionSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]
    pagination_class = CourseApiPagination

    def get_course(self):
        return get_object_or_404(Course, slug=self.kwargs['course_slug'])

    def get_queryset(self):
        return Section.objects.filter(course__slug=self.kwargs['course_slug']).select_related('course')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['course'] = self.get_course()
        return context

    def perform_create(self, serializer):
        course = self.get_course()
        if not user_can_manage_course(self.request.user, course):
            raise PermissionDenied('Only the course owner or an admin can manage this content.')
        serializer.save(course=course)


class SectionDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.select_related('course')
    serializer_class = SectionSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]


class SectionLessonsV1(generics.ListCreateAPIView):
    serializer_class = VersionedLessonSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]
    pagination_class = CourseApiPagination

    def get_section(self):
        return get_object_or_404(Section.objects.select_related('course'), pk=self.kwargs['section_pk'])

    def get_queryset(self):
        section = self.get_section()
        queryset = Lesson.objects.filter(section=section).select_related('course', 'section')
        if not user_can_access_course(self.request.user, section.course):
            queryset = queryset.filter(is_preview=True)
        return queryset

    def perform_create(self, serializer):
        section = self.get_section()
        if not user_can_manage_course(self.request.user, section.course):
            raise PermissionDenied('Only the course owner or an admin can manage this content.')
        serializer.save(course=section.course, section=section)


class LessonDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.select_related('course', 'section')
    serializer_class = VersionedLessonSerializer
    permission_classes = [CanReadLessonAndManageOwner]


class LessonResourcesV1(generics.ListCreateAPIView):
    serializer_class = CourseResourceSerializer
    permission_classes = [IsCourseOwnerOrStaffOrReadOnly]
    pagination_class = CourseApiPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_lesson(self):
        return get_object_or_404(
            Lesson.objects.select_related('course'),
            pk=self.kwargs['lesson_pk'],
        )

    def get_queryset(self):
        lesson = self.get_lesson()
        if lesson.is_preview or user_can_access_course(self.request.user, lesson.course):
            return CourseResource.objects.filter(lesson=lesson).select_related('lesson__course')
        raise PermissionDenied('You must be enrolled to access these resources.')

    def perform_create(self, serializer):
        lesson = self.get_lesson()
        if not user_can_manage_course(self.request.user, lesson.course):
            raise PermissionDenied('Only the course owner or an admin can manage this content.')
        serializer.save(lesson=lesson)


class ResourceDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseResource.objects.select_related('lesson__course')
    serializer_class = CourseResourceSerializer
    permission_classes = [CanReadResourceAndManageOwner]


class ResourceDownloadV1(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        resource = get_object_or_404(
            CourseResource.objects.select_related('lesson__course'),
            pk=pk,
        )
        self.check_object_permissions(request, resource)
        try:
            file_handle = resource.file.open('rb')
        except (FileNotFoundError, OSError):
            raise NotFound('The resource file is no longer available.')
        return FileResponse(
            file_handle,
            as_attachment=True,
            filename=Path(resource.file.name).name,
        )

    def get_permissions(self):
        from .permissions import CanAccessResource

        return [CanAccessResource()]


class EnrollmentProgressV1(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_enrollment(self):
        return get_object_or_404(
            Enrollment.objects.select_related('course'),
            pk=self.kwargs['enrollment_pk'],
            student=self.request.user,
        )

    def get(self, request, enrollment_pk):
        enrollment = self.get_enrollment()
        progress = enrollment.lesson_progress.select_related('lesson', 'lesson__section')
        total = enrollment.course.lessons.count()
        completed = progress.filter(completed=True).count()
        return Response({
            'enrollment_id': enrollment.pk,
            'course_id': enrollment.course_id,
            'total_lessons': total,
            'completed_lessons': completed,
            'progress_percentage': round(completed * 100 / total, 2) if total else 0,
            'lessons': LessonProgressSerializer(progress, many=True).data,
        })

    def post(self, request, enrollment_pk):
        enrollment = self.get_enrollment()
        serializer = LessonProgressSerializer(
            data=request.data,
            context={'enrollment': enrollment},
        )
        serializer.is_valid(raise_exception=True)
        lesson = serializer.validated_data['lesson']
        completed = serializer.validated_data.get('completed', False)
        with transaction.atomic():
            progress, _ = LessonProgress.objects.update_or_create(
                enrollment=enrollment,
                lesson=lesson,
                defaults={'completed': completed},
            )
            total = enrollment.course.lessons.count()
            completed_count = enrollment.lesson_progress.filter(completed=True).count()
            enrollment.completed = total > 0 and completed_count == total
            enrollment.save(update_fields=['completed'])
        return Response(
            LessonProgressSerializer(progress).data,
            status=200,
        )


class StudentDashboardV1(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).select_related(
            'course'
        ).annotate(
            total_lessons=Count('course__lessons', distinct=True),
            completed_lessons=Count(
                'lesson_progress',
                filter=Q(lesson_progress__completed=True),
                distinct=True,
            ),
        ).order_by('-enrolled_at', '-pk')
        paginator = CourseApiPagination()
        page = paginator.paginate_queryset(enrollments, request, view=self)
        return Response({
            'my_courses': DashboardEnrollmentSerializer(page, many=True).data,
            'certificates': [],
            'pagination': {
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
            },
        })


class CourseReviewListCreateV1(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CourseApiPagination

    def get_course(self):
        return get_object_or_404(Course, slug=self.kwargs['course_slug'])

    def get_queryset(self):
        return CourseReview.objects.filter(
            course__slug=self.kwargs['course_slug']
        ).select_related('student')

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied('Authentication is required to review a course.')
        course = self.get_course()
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            raise PermissionDenied('Only enrolled students can review this course.')
        if CourseReview.objects.filter(student=request.user, course=course).exists():
            raise ValidationError({'detail': 'You have already reviewed this course.'})

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                review = serializer.save(student=request.user, course=course)
        except IntegrityError as exc:
            raise ValidationError({'detail': 'You have already reviewed this course.'}) from exc
        return Response(
            self.get_serializer(review).data,
            status=201,
        )


class CourseReviewDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseReview.objects.select_related('student', 'course')
    serializer_class = CourseReviewSerializer
    permission_classes = [IsReviewOwnerOrAdmin]
