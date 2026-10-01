from django.contrib.auth import get_user_model
from django.urls import reverse
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
