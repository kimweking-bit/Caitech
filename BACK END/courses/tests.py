from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Course, Enrollment


User = get_user_model()
PASSWORD = 'R4ndom-Password!Value-2026'


class CourseApiTests(APITestCase):
	def setUp(self):
		self.category = Category.objects.create(name='Programming', slug='programming')
		self.instructor = self.create_instructor('course-owner', verified=True)
		self.course = Course.objects.create(
			title='Python Fundamentals',
			slug='python-fundamentals',
			description='An introduction to Python.',
			category=self.category,
			instructor=self.instructor,
		)

	def create_instructor(self, username, verified=False):
		return User.objects.create_user(
			username=username,
			password=PASSWORD,
			is_student=False,
			is_instructor=True,
			is_verified_instructor=verified,
		)

	def course_payload(self, **overrides):
		payload = {
			'title': 'Django Fundamentals',
			'slug': 'django-fundamentals',
			'description': 'Build applications with Django.',
			'category': self.category.pk,
			'price': '0.00',
			'is_free': True,
		}
		payload.update(overrides)
		return payload

	def test_course_list_and_detail_responses(self):
		list_response = self.client.get(reverse('course-list'))
		detail_response = self.client.get(
			reverse('course-detail', kwargs={'slug': self.course.slug})
		)

		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)
		self.assertEqual(list_response.data[0]['slug'], self.course.slug)
		self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
		self.assertEqual(detail_response.data['title'], self.course.title)
		self.assertEqual(detail_response.data['instructor_username'], self.instructor.username)

	def test_course_create_reports_missing_required_fields(self):
		self.client.force_authenticate(self.instructor)

		response = self.client.post(
			reverse('course-create'),
			{'title': 'Incomplete course'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('slug', response.data)
		self.assertIn('description', response.data)
		self.assertIn('category', response.data)

	def test_course_create_rejects_duplicate_slug(self):
		self.client.force_authenticate(self.instructor)

		response = self.client.post(
			reverse('course-create'),
			self.course_payload(slug=self.course.slug),
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('slug', response.data)


class CoursePermissionTests(APITestCase):
	def setUp(self):
		self.category = Category.objects.create(name='Design', slug='design')
		self.create_url = reverse('course-create')

	def create_user(self, username, **flags):
		return User.objects.create_user(
			username=username,
			password=PASSWORD,
			**flags,
		)

	def payload(self):
		return {
			'title': 'Interface Design',
			'slug': 'interface-design',
			'description': 'Designing usable interfaces.',
			'category': self.category.pk,
			'price': '15.00',
			'is_free': False,
		}

	def test_student_cannot_create_course(self):
		student = self.create_user('student', is_student=True)
		self.client.force_authenticate(student)

		response = self.client.post(self.create_url, self.payload(), format='json')

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_unverified_instructor_cannot_create_course(self):
		instructor = self.create_user(
			'unverified-instructor',
			is_student=False,
			is_instructor=True,
			is_verified_instructor=False,
		)
		self.client.force_authenticate(instructor)

		response = self.client.post(self.create_url, self.payload(), format='json')

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_verified_instructor_can_create_course(self):
		instructor = self.create_user(
			'verified-instructor',
			is_student=False,
			is_instructor=True,
			is_verified_instructor=True,
		)
		self.client.force_authenticate(instructor)

		response = self.client.post(self.create_url, self.payload(), format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['instructor'], instructor.pk)
		self.assertTrue(Course.objects.filter(slug='interface-design', instructor=instructor).exists())

	def test_anonymous_user_cannot_create_course(self):
		response = self.client.post(self.create_url, self.payload(), format='json')

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EnrollmentApiTests(APITestCase):
	def setUp(self):
		self.student = User.objects.create_user(
			username='enrollment-student',
			password=PASSWORD,
			is_student=True,
		)
		instructor = User.objects.create_user(
			username='enrollment-instructor',
			password=PASSWORD,
			is_student=False,
			is_instructor=True,
			is_verified_instructor=True,
		)
		category = Category.objects.create(name='Data', slug='data')
		self.course = Course.objects.create(
			title='Data Basics',
			slug='data-basics',
			description='Learn data fundamentals.',
			category=category,
			instructor=instructor,
		)
		self.enroll_url = reverse('course-enroll')

	def test_student_can_enroll(self):
		self.client.force_authenticate(self.student)

		response = self.client.post(
			self.enroll_url,
			{'course': self.course.pk},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['student'], self.student.pk)
		self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course).exists())

	def test_student_cannot_enroll_twice(self):
		Enrollment.objects.create(student=self.student, course=self.course)
		self.client.force_authenticate(self.student)

		response = self.client.post(
			self.enroll_url,
			{'course': self.course.pk},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(Enrollment.objects.filter(student=self.student, course=self.course).count(), 1)

	def test_integrity_error_during_enrollment_returns_validation_error(self):
		self.client.force_authenticate(self.student)

		with patch(
			'courses.views.EnrollmentSerializer.save',
			side_effect=IntegrityError('simulated enrollment race'),
		):
			response = self.client.post(
				self.enroll_url,
				{'course': self.course.pk},
				format='json',
			)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			response.data['detail'],
			'You are already enrolled in this course.',
		)

	def test_anonymous_user_cannot_enroll(self):
		response = self.client.post(
			self.enroll_url,
			{'course': self.course.pk},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
