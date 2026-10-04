from django.urls import path

from .api_views import (
    CategoryDetailV1,
    CategoryListCreateV1,
    CourseCatalogV1,
    CourseDetailV1,
    CourseReviewDetailV1,
    CourseReviewListCreateV1,
    CourseSectionsV1,
    EnrollmentProgressV1,
    LessonDetailV1,
    LessonResourcesV1,
    ResourceDetailV1,
    ResourceDownloadV1,
    SectionDetailV1,
    SectionLessonsV1,
    StudentDashboardV1,
)

urlpatterns = [
    path('dashboard/', StudentDashboardV1.as_view(), name='api-v1-student-dashboard'),
    path('enrollments/<int:enrollment_pk>/progress/', EnrollmentProgressV1.as_view(), name='api-v1-enrollment-progress'),
    path('categories/', CategoryListCreateV1.as_view(), name='api-v1-category-list'),
    path('categories/<slug:slug>/', CategoryDetailV1.as_view(), name='api-v1-category-detail'),
    path('sections/<int:pk>/', SectionDetailV1.as_view(), name='api-v1-section-detail'),
    path('sections/<int:section_pk>/lessons/', SectionLessonsV1.as_view(), name='api-v1-section-lessons'),
    path('lessons/<int:pk>/', LessonDetailV1.as_view(), name='api-v1-lesson-detail'),
    path('lessons/<int:lesson_pk>/resources/', LessonResourcesV1.as_view(), name='api-v1-lesson-resources'),
    path('resources/<int:pk>/download/', ResourceDownloadV1.as_view(), name='api-v1-resource-download'),
    path('resources/<int:pk>/', ResourceDetailV1.as_view(), name='api-v1-resource-detail'),
    path('<slug:course_slug>/sections/', CourseSectionsV1.as_view(), name='api-v1-course-sections'),
    path('<slug:course_slug>/reviews/', CourseReviewListCreateV1.as_view(), name='api-v1-course-reviews'),
    path('reviews/<int:pk>/', CourseReviewDetailV1.as_view(), name='api-v1-review-detail'),
    path('<slug:slug>/', CourseDetailV1.as_view(), name='api-v1-course-detail'),
    path('', CourseCatalogV1.as_view(), name='api-v1-course-list'),
]