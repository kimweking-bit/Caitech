from django.urls import path

from .views import (
    BlogPostDetailV1,
    BlogPostListCreateV1,
    ContactInquiryCreateV1,
    ContactInquiryListV1,
    NewsletterSubscribeV1,
    NewsletterSubscriptionListV1,
)

urlpatterns = [
    path('blog/posts/', BlogPostListCreateV1.as_view(), name='api-v1-blog-post-list'),
    path('blog/posts/<slug:slug>/', BlogPostDetailV1.as_view(), name='api-v1-blog-post-detail'),
    path('newsletter/subscribe/', NewsletterSubscribeV1.as_view(), name='api-v1-newsletter-subscribe'),
    path('newsletter/subscriptions/', NewsletterSubscriptionListV1.as_view(), name='api-v1-newsletter-subscriptions'),
    path('contact/', ContactInquiryCreateV1.as_view(), name='api-v1-contact-submit'),
    path('contact/inquiries/', ContactInquiryListV1.as_view(), name='api-v1-contact-inquiries'),
]
