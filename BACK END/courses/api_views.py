from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

from .models import Category, Course, CourseResource, Lesson, Section
from .permissions import (
    CanReadLessonAndManageOwner,
    CanReadResourceAndManageOwner,
    IsAdminOrReadOnly,
    IsCourseOwnerOrStaffOrReadOnly,
    user_can_access_course,
    user_can_manage_course,
)
from .serializers import (
    CourseResourceSerializer,
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
        )
        params = self.request.query_params
        category = params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

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
