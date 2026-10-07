import json
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Category, Course

from .models import LearningPathResponse
from .services import AIProviderFailure, AIProviderTimeout


class LearningPathApiTests(APITestCase):
	def setUp(self):
		cache.clear()
		self.student = User.objects.create_user(username='path-student', password='pass')
		self.admin = User.objects.create_user(
			username='path-admin', password='pass', is_staff=True,
		)
		category = Category.objects.create(name='Technology', slug='technology')
		self.course = Course.objects.create(
			title='Data Analytics Diploma',
			slug='data-analytics-diploma',
			description='A diploma in data analytics.',
			category=category,
			instructor=self.admin,
			course_type='diploma',
			duration='6 Semesters',
			delivery_modes=['online', 'recorded'],
			intake_status='ongoing',
		)
		self.url = reverse('api-v1-ai-path-submit')
		self.admin_url = reverse('api-v1-ai-path-responses')
		self.payload = {
			'goals': 'Build practical data analysis skills.',
			'current_skill_level': 'beginner',
			'interests': 'Statistics and data visualization.',
			'hours_per_week': 6,
			'name': 'Alex Learner',
			'email': 'Alex@example.com',
			'phone': '+254 700 123 456',
		}

	def completion_json(self, recommendations=None):
		return json.dumps({
			'summary': 'Start with a course matched to your goals and schedule.',
			'recommendations': recommendations if recommendations is not None else [
				{'course_id': self.course.pk, 'reason': 'Matches your interests and time.'},
			],
		})

	@patch('ai_path.services.request_ai_completion')
	def test_valid_recommendation_is_returned_and_lead_is_saved(self, mock_completion):
		mock_completion.return_value = self.completion_json()

		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['recommendations'][0]['course_id'], self.course.pk)
		self.assertEqual(response.data['recommendations'][0]['title'], self.course.title)
		self.assertNotIn('email', response.data)
		self.assertNotIn('phone', response.data)
		stored = LearningPathResponse.objects.get()
		self.assertEqual(stored.status, LearningPathResponse.Status.COMPLETED)
		self.assertEqual(stored.name, 'Alex Learner')
		self.assertEqual(stored.email, 'alex@example.com')
		self.assertEqual(stored.phone, '+254 700 123 456')
		self.assertEqual(stored.recommendations[0]['course_id'], self.course.pk)
		mock_completion.assert_called_once()
		prompt = mock_completion.call_args.args[0]
		self.assertIn(self.course.title, prompt)

	@patch('ai_path.services.request_ai_completion')
	def test_invalid_catalogue_ids_are_discarded(self, mock_completion):
		mock_completion.return_value = self.completion_json([
			{'course_id': self.course.pk, 'reason': 'Valid course.'},
			{'course_id': 999999, 'reason': 'Not in the catalogue.'},
		])

		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(len(response.data['recommendations']), 1)
		self.assertEqual(response.data['recommendations'][0]['course_id'], self.course.pk)
		self.assertEqual(len(LearningPathResponse.objects.get().recommendations), 1)

	@patch('ai_path.services.request_ai_completion', return_value='not json')
	def test_malformed_json_returns_controlled_error_and_records_failure(self, mock_completion):
		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
		self.assertEqual(response.data['error']['code'], 'AI_INVALID_RESPONSE')
		self.assertNotIn('traceback', str(response.data).lower())
		stored = LearningPathResponse.objects.get()
		self.assertEqual(stored.status, LearningPathResponse.Status.FAILED)
		self.assertEqual(stored.error_code, 'AI_INVALID_RESPONSE')

	@patch('ai_path.services.request_ai_completion')
	def test_schema_invalid_json_types_are_rejected(self, mock_completion):
		mock_completion.return_value = json.dumps({
			'summary': 'Looks valid at a glance.',
			'recommendations': [{'course_id': True, 'reason': 'Boolean is not an ID.'}],
		})

		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
		self.assertEqual(response.data['error']['code'], 'AI_INVALID_RESPONSE')
		self.assertEqual(LearningPathResponse.objects.get().recommendations, [])

	@patch('ai_path.services.request_ai_completion', side_effect=AIProviderTimeout())
	def test_provider_timeout_returns_controlled_error(self, mock_completion):
		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)
		self.assertEqual(response.data['error']['code'], 'AI_PROVIDER_TIMEOUT')
		self.assertEqual(LearningPathResponse.objects.get().status, LearningPathResponse.Status.FAILED)

	@patch('ai_path.services.request_ai_completion', side_effect=AIProviderFailure())
	def test_provider_failure_returns_controlled_error(self, mock_completion):
		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
		self.assertEqual(response.data['error']['code'], 'AI_PROVIDER_ERROR')

	@override_settings(
		AI_API_KEY='',
		AI_PROVIDER='openai_compatible',
		AI_MODEL='test-model',
		AI_API_BASE_URL='https://provider.example/v1',
	)
	@patch('ai_path.services.requests.post')
	def test_missing_api_key_returns_controlled_configuration_error(self, mock_post):
		response = self.client.post(self.url, self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
		self.assertEqual(response.data['error']['code'], 'AI_NOT_CONFIGURED')
		mock_post.assert_not_called()

	def test_admin_response_list_is_private(self):
		self.assertEqual(self.client.get(self.admin_url).status_code, status.HTTP_401_UNAUTHORIZED)
		self.client.force_authenticate(self.student)
		self.assertEqual(self.client.get(self.admin_url).status_code, status.HTTP_403_FORBIDDEN)
		self.client.force_authenticate(self.admin)
		self.assertEqual(self.client.get(self.admin_url).status_code, status.HTTP_200_OK)

	@patch('ai_path.services.request_ai_completion')
	def test_filled_honeypot_is_not_saved(self, mock_completion):
		response = self.client.post(
			self.url,
			{**self.payload, 'website': 'spam.example'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
		self.assertEqual(LearningPathResponse.objects.count(), 0)
		mock_completion.assert_not_called()

	@patch('ai_path.services.request_ai_completion')
	def test_public_questionnaire_is_rate_limited(self, mock_completion):
		mock_completion.return_value = self.completion_json()
		cache.clear()

		for index in range(5):
			response = self.client.post(
				self.url,
				{**self.payload, 'email': f'learner-{index}@example.com'},
				format='json',
			)
			self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		limited = self.client.post(
			self.url,
			{**self.payload, 'email': 'learner-six@example.com'},
			format='json',
		)
		self.assertEqual(limited.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
		self.assertEqual(LearningPathResponse.objects.count(), 5)
