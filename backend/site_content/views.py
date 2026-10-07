from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import ContactInquiry, NewsletterSubscription, Post
from .serializers import (
    ContactInquirySerializer,
    ContactAcceptedSerializer,
    NewsletterSubscribeSerializer,
    NewsletterSubscriptionSerializer,
    PostSerializer,
)


class SiteContentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class BlogPostListCreateV1(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    pagination_class = SiteContentPagination

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        posts = Post.objects.prefetch_related('categories', 'tags')
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            posts = posts.filter(status=Post.Status.PUBLISHED)
        return posts


class BlogPostDetailV1(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        posts = Post.objects.prefetch_related('categories', 'tags')
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            posts = posts.filter(status=Post.Status.PUBLISHED)
        return posts


class NewsletterSubscribeV1(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'newsletter'

    @extend_schema(
        request=NewsletterSubscribeSerializer,
        responses={201: NewsletterSubscriptionSerializer},
    )
    def post(self, request):
        serializer = NewsletterSubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                subscription = serializer.save()
        except IntegrityError as exc:
            raise ValidationError({'email': ['This email is already subscribed.']}) from exc
        return Response(
            NewsletterSubscriptionSerializer(subscription).data,
            status=status.HTTP_201_CREATED,
        )


class NewsletterSubscriptionListV1(generics.ListAPIView):
    queryset = NewsletterSubscription.objects.all()
    serializer_class = NewsletterSubscriptionSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = SiteContentPagination


class ContactInquiryCreateV1(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    @extend_schema(
        request=ContactInquirySerializer,
        responses={
            201: ContactInquirySerializer,
            202: ContactAcceptedSerializer,
        },
    )
    def post(self, request):
        serializer = ContactInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('website'):
            return Response(
                {'detail': 'Thank you for contacting Caitech.'},
                status=status.HTTP_202_ACCEPTED,
            )
        inquiry = serializer.save()
        return Response(
            ContactInquirySerializer(inquiry).data,
            status=status.HTTP_201_CREATED,
        )


class ContactInquiryListV1(generics.ListAPIView):
    queryset = ContactInquiry.objects.select_related('course')
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = SiteContentPagination
