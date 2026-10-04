from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()
PASSWORD = 'R4ndom-Password!Value-2026'


class RegistrationTests(APITestCase):
	def setUp(self):
		self.register_url = reverse('register')

	def register(self, **overrides):
		payload = {
			'username': 'new-student',
			'email': 'new-student@example.com',
			'password': PASSWORD,
		}
		payload.update(overrides)
		return self.client.post(self.register_url, payload, format='json')

	def test_register_success_does_not_return_password(self):
		response = self.register()

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertNotIn('password', response.data)
		user = User.objects.get(username='new-student')
		self.assertTrue(user.check_password(PASSWORD))
		self.assertTrue(user.is_student)
		self.assertFalse(user.is_instructor)

	def test_registration_cannot_assign_instructor_role(self):
		response = self.register(is_student=False, is_instructor=True)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		user = User.objects.get(username='new-student')
		self.assertTrue(user.is_student)
		self.assertFalse(user.is_instructor)

	def test_duplicate_username_is_rejected(self):
		User.objects.create_user(username='existing', password=PASSWORD)

		response = self.register(username='existing')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('username', response.data)

	def test_duplicate_email_is_rejected(self):
		User.objects.create_user(
			username='existing',
			email='new-student@example.com',
			password=PASSWORD,
		)

		response = self.register()

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('email', response.data)

	def test_duplicate_email_is_rejected_case_insensitively(self):
		User.objects.create_user(
			username='existing',
			email='New-Student@Example.com',
			password=PASSWORD,
		)

		response = self.register()

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			str(response.data['email'][0]),
			'A user with this email already exists.',
		)

	def test_weak_and_missing_password_are_rejected(self):
		weak_response = self.register(password='123')
		missing_response = self.client.post(
			self.register_url,
			{'username': 'missing-password', 'email': 'missing@example.com'},
			format='json',
		)

		self.assertEqual(weak_response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('password', weak_response.data)
		self.assertEqual(missing_response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('password', missing_response.data)

	def test_invalid_registration_payload_is_rejected(self):
		response = self.register(username='', email='not-an-email')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('username', response.data)
		self.assertIn('email', response.data)


class JsonWebTokenTests(APITestCase):
	def setUp(self):
		cache.clear()
		self.user = User.objects.create_user(
			username='login-student',
			email='login-student@example.com',
			password=PASSWORD,
		)
		self.login_url = reverse('token_obtain_pair')
		self.refresh_url = reverse('token_refresh')

	def test_login_returns_access_and_refresh_tokens(self):
		response = self.client.post(
			self.login_url,
			{'username': self.user.username, 'password': PASSWORD},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('access', response.data)
		self.assertIn('refresh', response.data)

	def test_login_rejects_invalid_password(self):
		response = self.client.post(
			self.login_url,
			{'username': self.user.username, 'password': 'incorrect-password'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_refresh_returns_new_access_token(self):
		login_response = self.client.post(
			self.login_url,
			{'username': self.user.username, 'password': PASSWORD},
			format='json',
		)

		response = self.client.post(
			self.refresh_url,
			{'refresh': login_response.data['refresh']},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('access', response.data)


class AuthApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='auth-student',
			email='auth-student@example.com',
			password=PASSWORD,
		)

	def test_me_requires_authentication(self):
		response = self.client.get(reverse('api-v1-me'))

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_me_returns_user_and_role_fields(self):
		self.client.force_authenticate(self.user)

		response = self.client.get(reverse('api-v1-me'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['id'], self.user.pk)
		self.assertTrue(response.data['is_student'])
		self.assertFalse(response.data['is_instructor'])

	def test_profile_cannot_change_roles(self):
		self.client.force_authenticate(self.user)

		response = self.client.patch(
			reverse('api-v1-me'),
			{'is_student': False, 'is_instructor': True, 'is_staff': True},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.user.refresh_from_db()
		self.assertTrue(self.user.is_student)
		self.assertFalse(self.user.is_instructor)
		self.assertFalse(self.user.is_staff)


@override_settings(
	EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
	FRONTEND_URL='https://frontend.example',
)
class PasswordResetApiTests(APITestCase):
	def setUp(self):
		cache.clear()
		self.user = User.objects.create_user(
			username='reset-student',
			email='reset-student@example.com',
			password=PASSWORD,
		)

	def test_reset_request_sends_link_for_existing_user(self):
		response = self.client.post(
			reverse('api-v1-password-reset'),
			{'email': self.user.email},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn('https://frontend.example/reset-password/', mail.outbox[0].body)

	def test_reset_request_does_not_disclose_unknown_email(self):
		response = self.client.post(
			reverse('api-v1-password-reset'),
			{'email': 'unknown@example.com'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
		self.assertIn('If an account exists', response.data['detail'])
		self.assertEqual(len(mail.outbox), 0)

	def test_reset_confirmation_changes_password_and_invalidates_token(self):
		payload = {
			'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
			'token': default_token_generator.make_token(self.user),
			'new_password': 'N3w-Password!2026',
		}

		response = self.client.post(
			reverse('api-v1-password-reset-confirm'), payload, format='json'
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.user.refresh_from_db()
		self.assertTrue(self.user.check_password(payload['new_password']))
		self.assertEqual(
			self.client.post(
				reverse('api-v1-password-reset-confirm'), payload, format='json'
			).status_code,
			status.HTTP_400_BAD_REQUEST,
		)

	def test_reset_confirmation_rejects_invalid_token(self):
		response = self.client.post(
			reverse('api-v1-password-reset-confirm'),
			{
				'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
				'token': 'invalid-token',
				'new_password': 'N3w-Password!2026',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_reset_confirmation_rejects_malformed_uid(self):
		response = self.client.post(
			reverse('api-v1-password-reset-confirm'),
			{
				'uid': '_w',
				'token': 'invalid-token',
				'new_password': 'N3w-Password!2026',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InstructorApprovalApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='instructor-applicant', password=PASSWORD
		)
		self.admin = User.objects.create_user(
			username='auth-admin', password=PASSWORD, is_staff=True
		)

	def test_user_can_request_instructor_status_but_is_not_verified(self):
		self.client.force_authenticate(self.user)

		response = self.client.post(reverse('api-v1-instructor-request'), {}, format='json')

		self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
		self.user.refresh_from_db()
		self.assertTrue(self.user.is_instructor)
		self.assertFalse(self.user.is_verified_instructor)

	def test_only_admin_can_list_and_review_requests(self):
		self.user.is_instructor = True
		self.user.save(update_fields=['is_instructor'])
		queue_url = reverse('api-v1-instructor-queue')
		review_url = reverse('api-v1-instructor-review', kwargs={'pk': self.user.pk})

		self.client.force_authenticate(self.user)
		self.assertEqual(self.client.get(queue_url).status_code, status.HTTP_403_FORBIDDEN)
		self.assertEqual(
			self.client.post(review_url, {'approved': True}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.admin)
		queue_response = self.client.get(queue_url)
		self.assertEqual(queue_response.status_code, status.HTTP_200_OK)
		self.assertEqual(queue_response.data['count'], 1)

		approve_response = self.client.post(
			review_url, {'approved': True}, format='json'
		)
		self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
		self.user.refresh_from_db()
		self.assertTrue(self.user.is_verified_instructor)

	def test_admin_can_reject_instructor_request(self):
		self.user.is_instructor = True
		self.user.save(update_fields=['is_instructor'])
		self.client.force_authenticate(self.admin)

		response = self.client.post(
			reverse('api-v1-instructor-review', kwargs={'pk': self.user.pk}),
			{'approved': False},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.user.refresh_from_db()
		self.assertFalse(self.user.is_instructor)
		self.assertFalse(self.user.is_verified_instructor)


class AuthThrottleTests(APITestCase):
	@override_settings(
		REST_FRAMEWORK={
			'DEFAULT_AUTHENTICATION_CLASSES': (
				'rest_framework_simplejwt.authentication.JWTAuthentication',
			),
			'DEFAULT_THROTTLE_RATES': {
				'login': '1/minute',
				'password_reset': '1/minute',
			},
		}
	)
	def test_login_and_password_reset_are_throttled(self):
		cache.clear()
		login_data = {'username': 'missing-user', 'password': 'invalid'}
		login_url = reverse('api-v1-login')
		for attempt in range(5):
			response = self.client.post(login_url, login_data, format='json')
			self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertEqual(
			self.client.post(login_url, login_data, format='json').status_code,
			status.HTTP_429_TOO_MANY_REQUESTS,
		)

		reset_url = reverse('api-v1-password-reset')
		for attempt in range(3):
			response = self.client.post(
				reset_url, {'email': 'missing@example.com'}, format='json'
			)
			self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
		self.assertEqual(
			self.client.post(reset_url, {'email': 'missing@example.com'}, format='json').status_code,
			status.HTTP_429_TOO_MANY_REQUESTS,
		)
