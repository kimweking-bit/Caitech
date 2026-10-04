from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    InstructorRequestQueueView,
    InstructorRequestView,
    InstructorReviewView,
    LoginView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api-v1-register'),
    path('login/', LoginView.as_view(), name='api-v1-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api-v1-token-refresh'),
    path('me/', ProfileView.as_view(), name='api-v1-me'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='api-v1-password-reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='api-v1-password-reset-confirm'),
    path('instructor/request/', InstructorRequestView.as_view(), name='api-v1-instructor-request'),
    path('instructor/requests/', InstructorRequestQueueView.as_view(), name='api-v1-instructor-queue'),
    path('instructor/requests/<int:pk>/review/', InstructorReviewView.as_view(), name='api-v1-instructor-review'),
]