from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    InstructorReviewSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserRegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        for user in User.objects.filter(email__iexact=email, is_active=True):
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/"
                f"?uid={uid}&token={token}"
            )
            send_mail(
                'Reset your Caitech password',
                f'Use this link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )

        return Response(
            {'detail': 'If an account exists for that email, reset instructions have been sent.'},
            status=status.HTTP_202_ACCEPTED,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password has been reset.'}, status=status.HTTP_200_OK)


class InstructorRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_verified_instructor:
            return Response(
                {'detail': 'This account is already an approved instructor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.is_instructor:
            return Response(
                {'detail': 'An instructor request is already pending review.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_instructor = True
        user.save(update_fields=['is_instructor'])
        return Response(UserSerializer(user).data, status=status.HTTP_202_ACCEPTED)


class InstructorQueuePagination(PageNumberPagination):
    page_size = 20


class InstructorRequestQueueView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = InstructorQueuePagination

    def get_queryset(self):
        return User.objects.filter(is_instructor=True, is_verified_instructor=False).order_by('date_joined')


class InstructorReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        serializer = InstructorReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        applicant = get_object_or_404(
            User,
            pk=pk,
            is_instructor=True,
            is_verified_instructor=False,
        )

        if serializer.validated_data['approved']:
            applicant.is_verified_instructor = True
        else:
            applicant.is_instructor = False
        applicant.save(update_fields=['is_instructor', 'is_verified_instructor'])
        return Response(UserSerializer(applicant).data, status=status.HTTP_200_OK)