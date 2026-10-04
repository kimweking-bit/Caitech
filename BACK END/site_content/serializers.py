import re

from rest_framework import serializers

from courses.models import Course

from .models import (
    BlogCategory,
    ContactInquiry,
    NewsletterSubscription,
    Post,
    Tag,
)


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug']
        read_only_fields = fields


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = fields


class PostSerializer(serializers.ModelSerializer):
    categories = serializers.SlugRelatedField(
        many=True,
        slug_field='slug',
        queryset=BlogCategory.objects.all(),
        required=False,
    )
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='slug',
        queryset=Tag.objects.all(),
        required=False,
    )

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'body', 'featured_image',
            'published_at', 'status', 'categories', 'tags', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NewsletterSubscribeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['email']

    def validate_email(self, value):
        normalized = value.strip().lower()
        if NewsletterSubscription.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('This email is already subscribed.')
        return normalized


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['id', 'email', 'subscribed_at']
        read_only_fields = fields


class ContactInquirySerializer(serializers.ModelSerializer):
    website = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=200,
    )
    phone = serializers.CharField(max_length=32)
    message = serializers.CharField(min_length=10, max_length=5000)

    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'phone', 'message', 'course', 'created_at', 'website']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError('Name is required.')
        return normalized

    def validate_phone(self, value):
        normalized = value.strip()
        if not re.fullmatch(r'[0-9+().\-\s]{7,32}', normalized) or sum(
            character.isdigit() for character in normalized
        ) < 7:
            raise serializers.ValidationError('Enter a valid phone number.')
        return normalized

    def validate_message(self, value):
        normalized = value.strip()
        if len(normalized) < 10:
            raise serializers.ValidationError('Message must be at least 10 characters.')
        return normalized

    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)
