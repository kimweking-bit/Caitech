from django.urls import path
from .views import (
    CategoryListView, CourseListView, CourseDetailView,
    CourseCreateView, LessonDetailView,
    EnrollmentCreateView, MyEnrollmentsView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('create/', CourseCreateView.as_view(), name='course-create'),
    path('enroll/', EnrollmentCreateView.as_view(), name='course-enroll'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('', CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),
]