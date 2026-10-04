from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import LearningPathResponse
from .serializers import (
	LearningPathAdminSerializer,
	LearningPathQuestionnaireSerializer,
	LearningPathResultSerializer,
)
from .services import AIPathServiceError, generate_recommendations


class LearningPathPagination(PageNumberPagination):
	page_size = 20
	page_size_query_param = 'page_size'
	max_page_size = 100


class LearningPathQuestionnaireV1(APIView):
	permission_classes = [permissions.AllowAny]
	throttle_classes = [ScopedRateThrottle]
	throttle_scope = 'ai_path'

	def post(self, request):
		serializer = LearningPathQuestionnaireSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		if serializer.validated_data.get('website', ''):
			return Response(
				{'detail': 'Your learning path request could not be processed.'},
				status=status.HTTP_202_ACCEPTED,
			)

		response_record = serializer.save(
			provider=settings.AI_PROVIDER,
			model=settings.AI_MODEL,
			status=LearningPathResponse.Status.PENDING,
		)
		try:
			result = generate_recommendations(response_record)
		except AIPathServiceError as exc:
			response_record.status = LearningPathResponse.Status.FAILED
			response_record.error_code = exc.code
			response_record.completed_at = timezone.now()
			response_record.save(update_fields=['status', 'error_code', 'completed_at'])
			return Response(
				{'error': {'code': exc.code, 'detail': exc.public_detail}},
				status=exc.http_status,
			)

		response_record.recommendation_summary = result['summary']
		response_record.recommendations = result['recommendations']
		response_record.status = LearningPathResponse.Status.COMPLETED
		response_record.completed_at = timezone.now()
		response_record.save(update_fields=[
			'recommendation_summary', 'recommendations', 'status', 'completed_at',
		])
		return Response(
			LearningPathResultSerializer(response_record).data,
			status=status.HTTP_201_CREATED,
		)


class LearningPathResponseListV1(generics.ListAPIView):
	queryset = LearningPathResponse.objects.all()
	serializer_class = LearningPathAdminSerializer
	permission_classes = [permissions.IsAdminUser]
	pagination_class = LearningPathPagination
