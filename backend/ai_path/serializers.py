import re

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from courses.models import Course

from .models import LearningPathResponse


class LearningPathQuestionnaireSerializer(serializers.ModelSerializer):
    current_skill_level = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced']
    )
    goals = serializers.CharField(min_length=2, max_length=2000, trim_whitespace=True)
    interests = serializers.CharField(min_length=2, max_length=2000, trim_whitespace=True)
    hours_per_week = serializers.IntegerField(min_value=1, max_value=168)
    name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    website = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        write_only=True,
    )

    class Meta:
        model = LearningPathResponse
        fields = [
            'goals', 'current_skill_level', 'interests', 'hours_per_week',
            'name', 'email', 'phone', 'website',
        ]

    def validate_phone(self, value):
        normalized = value.strip()
        if normalized and (
            not re.fullmatch(r'[0-9+().\-\s]{7,32}', normalized)
            or sum(character.isdigit() for character in normalized) < 7
        ):
            raise serializers.ValidationError('Enter a valid phone number.')
        return normalized

    def validate(self, attrs):
        if attrs.get('name', '').strip():
            attrs['name'] = attrs['name'].strip()
        if attrs.get('email'):
            attrs['email'] = attrs['email'].strip().lower()
        return attrs

    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)


class RecommendationItemSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(min_length=1, max_length=1000)

    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) != {'course_id', 'reason'}:
            raise serializers.ValidationError(
                'Each recommendation must contain only course_id and reason.'
            )
        if (
            not isinstance(data['course_id'], int)
            or isinstance(data['course_id'], bool)
            or not isinstance(data['reason'], str)
        ):
            raise serializers.ValidationError('Recommendation fields have invalid JSON types.')
        return super().to_internal_value(data)


class LearningPathRecommendationResultSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    course_type = serializers.CharField(allow_blank=True)
    duration = serializers.CharField(allow_blank=True)
    delivery_modes = serializers.ListField(child=serializers.CharField())
    intake_status = serializers.CharField(allow_blank=True)
    reason = serializers.CharField()


class AIRecommendationSchemaSerializer(serializers.Serializer):
    summary = serializers.CharField(min_length=1, max_length=2000)
    recommendations = RecommendationItemSerializer(many=True, allow_empty=True, max_length=5)

    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) != {'summary', 'recommendations'}:
            raise serializers.ValidationError(
                'The response must contain only summary and recommendations.'
            )
        if not isinstance(data['summary'], str) or not isinstance(data['recommendations'], list):
            raise serializers.ValidationError('The response fields have invalid JSON types.')
        return super().to_internal_value(data)


class LearningPathResultSerializer(serializers.ModelSerializer):
    recommendations = serializers.SerializerMethodField()
    class Meta:
        model = LearningPathResponse
        fields = [
            'id', 'recommendation_summary', 'recommendations', 'status', 'created_at',
        ]
        read_only_fields = fields

    @extend_schema_field(LearningPathRecommendationResultSerializer(many=True))
    def get_recommendations(self, response):
        stored = response.recommendations or []
        course_ids = [item['course_id'] for item in stored]
        courses = Course.objects.filter(pk__in=course_ids).select_related('category')
        courses_by_id = {course.pk: course for course in courses}
        results = []
        for item in stored:
            course = courses_by_id.get(item['course_id'])
            if course is None:
                continue
            results.append({
                'course_id': course.pk,
                'title': course.title,
                'slug': course.slug,
                'course_type': course.course_type,
                'duration': course.duration,
                'delivery_modes': course.delivery_modes,
                'intake_status': course.intake_status,
                'reason': item['reason'],
            })
        return results


class LearningPathErrorDetailSerializer(serializers.Serializer):
    code = serializers.CharField()
    detail = serializers.CharField()


class LearningPathErrorSerializer(serializers.Serializer):
    error = LearningPathErrorDetailSerializer()


class LearningPathAcceptedSerializer(serializers.Serializer):
    detail = serializers.CharField()


class LearningPathAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPathResponse
        fields = [
            'id', 'goals', 'current_skill_level', 'interests', 'hours_per_week',
            'name', 'email', 'phone', 'recommendations', 'recommendation_summary',
            'provider', 'model', 'status', 'error_code', 'created_at', 'completed_at',
        ]
        read_only_fields = fields
