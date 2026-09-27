from django.urls import path
from .views import CategoryListView, CourseListView, CourseDetailView, LessonDetailView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', CourseListView.as_view(), name='course-list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
]