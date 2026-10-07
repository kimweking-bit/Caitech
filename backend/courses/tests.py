from unittest.mock import patch
import tempfile
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import override_settings
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
	Assignment,
	AssignmentSubmission,
	Category,
	Choice,
	Course,
	CourseReview,
	Enrollment,
	Lesson,
	LessonProgress,
	Question,
	Quiz,
	QuizAttempt,
	Section,
)


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
			is_free=True,
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
			is_free=True,
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

	def test_student_cannot_enroll_in_paid_course_without_payment(self):
		paid_course = Course.objects.create(
			title='Paid Data Course',
			slug='paid-data-course',
			description='A paid course.',
			category=self.course.category,
			instructor=self.course.instructor,
			price='50.00',
			is_free=False,
		)
		self.client.force_authenticate(self.student)

		response = self.client.post(
			self.enroll_url,
			{'course': paid_course.pk},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=paid_course).exists())

		paid_course.is_free = True
		paid_course.save(update_fields=['is_free'])
		misconfigured_response = self.client.post(
			self.enroll_url,
			{'course': paid_course.pk},
			format='json',
		)

		self.assertEqual(misconfigured_response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(Enrollment.objects.filter(student=self.student, course=paid_course).exists())

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


class AdminEnrollmentOperationsTests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_user(
			username='admin-enrolment-owner',
			password=PASSWORD,
			is_staff=True,
		)
		self.student = User.objects.create_user(
			username='manual-enrolment-student',
			password=PASSWORD,
			email='manual-student@example.com',
		)
		self.instructor = User.objects.create_user(
			username='manual-course-instructor',
			password=PASSWORD,
			is_student=False,
			is_instructor=True,
			is_verified_instructor=True,
		)
		self.category = Category.objects.create(name='Admin Ops', slug='admin-ops')
		self.first_course = Course.objects.create(
			title='Admin Course One',
			slug='admin-course-one',
			description='First admin-managed course',
			category=self.category,
			instructor=self.instructor,
			is_free=True,
		)
		self.second_course = Course.objects.create(
			title='Admin Course Two',
			slug='admin-course-two',
			description='Second admin-managed course',
			category=self.category,
			instructor=self.instructor,
			is_free=True,
		)

	@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
	def test_manual_enrollment_tracks_admin_and_sends_confirmation_email(self):
		self.client.force_authenticate(self.admin)
		response = self.client.post(
			reverse('api-v1-admin-manual-enrollment'),
			{
				'student': self.student.pk,
				'course': self.first_course.pk,
				'note': 'Sponsored by employer',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['enrolled_by'], self.admin.pk)
		self.assertEqual(response.data['note'], 'Sponsored by employer')
		self.assertTrue(
			Enrollment.objects.filter(student=self.student, course=self.first_course).exists()
		)
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn('Enrollment confirmed', mail.outbox[0].subject)

	def test_manual_enrollment_rejects_duplicates(self):
		self.client.force_authenticate(self.admin)
		Enrollment.objects.create(student=self.student, course=self.first_course, enrolled_by=self.admin)
		response = self.client.post(
			reverse('api-v1-admin-manual-enrollment'),
			{'student': self.student.pk, 'course': self.first_course.pk, 'note': 'Again'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(Enrollment.objects.filter(student=self.student, course=self.first_course).count(), 1)

	def test_admin_enrollment_report_filters_and_summarises(self):
		self.client.force_authenticate(self.admin)
		first = Enrollment.objects.create(student=self.student, course=self.first_course, enrolled_by=self.admin)
		other_student = User.objects.create_user(username='other-report-student', password=PASSWORD)
		second = Enrollment.objects.create(student=other_student, course=self.second_course, enrolled_by=self.admin)
		first.enrolled_at = timezone.now() - timedelta(days=5)
		first.save(update_fields=['enrolled_at'])
		second.enrolled_at = timezone.now() - timedelta(days=1)
		second.save(update_fields=['enrolled_at'])

		response = self.client.get(
			reverse('api-v1-admin-enrollment-report'),
			{
				'course': self.first_course.pk,
				'start_date': (timezone.now() - timedelta(days=10)).date().isoformat(),
				'end_date': (timezone.now() + timedelta(days=1)).date().isoformat(),
			},
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['summary']['total_students'], 1)
		self.assertEqual(response.data['summary']['total_courses'], 1)
		self.assertIn(self.first_course.slug, response.data['summary']['enrolments_per_course'])
		self.assertEqual(response.data['count'], 1)

	def test_non_admin_is_blocked_from_admin_enrollment_endpoints(self):
		self.client.force_authenticate(self.student)
		self.assertEqual(
			self.client.post(
				reverse('api-v1-admin-manual-enrollment'),
				{'student': self.student.pk, 'course': self.first_course.pk},
				format='json',
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.assertEqual(
			self.client.get(reverse('api-v1-admin-enrollments')).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.assertEqual(
			self.client.get(reverse('api-v1-admin-enrollment-report')).status_code,
			status.HTTP_403_FORBIDDEN,
		)


class LessonAccessTests(APITestCase):
	def setUp(self):
		self.instructor = User.objects.create_user(
			username='lesson-instructor',
			password=PASSWORD,
			is_student=False,
			is_instructor=True,
			is_verified_instructor=True,
		)
		self.student = User.objects.create_user(username='lesson-student', password=PASSWORD)
		self.category = Category.objects.create(name='Security', slug='security')
		self.course = Course.objects.create(
			title='Secure Course',
			slug='secure-course',
			description='A course with protected lessons.',
			category=self.category,
			instructor=self.instructor,
			is_free=False,
			price='25.00',
		)
		self.preview = Lesson.objects.create(
			course=self.course,
			title='Preview lesson',
			video_url='https://example.com/preview',
			is_preview=True,
		)
		self.protected = Lesson.objects.create(
			course=self.course,
			title='Protected lesson',
			video_url='https://example.com/protected',
			is_preview=False,
		)

	def test_preview_lesson_is_public(self):
		response = self.client.get(reverse('lesson-detail', kwargs={'pk': self.preview.pk}))

		self.assertEqual(response.status_code, status.HTTP_200_OK)


class Phase2CourseApiTests(APITestCase):
	def setUp(self):
		self.owner = self.create_user('phase2-owner', verified=True, is_instructor=True, is_student=False)
		self.other_instructor = self.create_user(
			'phase2-other', verified=True, is_instructor=True, is_student=False
		)
		self.student = self.create_user('phase2-student', is_student=True)
		self.admin = self.create_user('phase2-admin', is_staff=True)
		self.category = Category.objects.create(name='Programming', slug='programming')
		self.other_category = Category.objects.create(name='Art', slug='art')
		self.course = Course.objects.create(
			title='Python Foundations',
			slug='python-foundations',
			description='Learn Python programming.',
			category=self.category,
			instructor=self.owner,
			price='0.00',
			is_free=True,
		)
		self.paid_course = Course.objects.create(
			title='Advanced Python',
			slug='advanced-python',
			description='Advanced programming topics.',
			category=self.category,
			instructor=self.owner,
			price='50.00',
			is_free=False,
		)

	def create_user(self, username, verified=False, **flags):
		flags.setdefault('is_verified_instructor', verified)
		return User.objects.create_user(username=username, password=PASSWORD, **flags)

	def test_catalog_search_filter_and_pagination(self):
		search_response = self.client.get(reverse('api-v1-course-list'), {'search': 'foundations'})
		filtered_response = self.client.get(
			reverse('api-v1-course-list'),
			{
				'category': self.category.slug,
				'is_free': 'true',
				'min_price': '0',
				'max_price': '0',
			},
		)
		paginated_response = self.client.get(
			reverse('api-v1-course-list'), {'page_size': '1'}
		)

		self.assertEqual(search_response.status_code, status.HTTP_200_OK)
		self.assertEqual(search_response.data['count'], 1)
		self.assertEqual(search_response.data['results'][0]['id'], self.course.pk)
		self.assertEqual(filtered_response.data['count'], 1)
		self.assertEqual(paginated_response.data['count'], 2)
		self.assertEqual(len(paginated_response.data['results']), 1)
		self.assertIsNotNone(paginated_response.data['next'])

	def test_catalog_rejects_invalid_filter_values(self):
		response = self.client.get(reverse('api-v1-course-list'), {'is_free': 'sometimes'})
		price_response = self.client.get(
			reverse('api-v1-course-list'), {'min_price': 'not-a-price'}
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('is_free', response.data)
		self.assertEqual(price_response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('min_price', price_response.data)

	def test_only_admin_can_manage_categories(self):
		categories_url = reverse('api-v1-category-list')
		self.assertEqual(self.client.get(categories_url).status_code, status.HTTP_200_OK)
		self.assertEqual(self.client.post(categories_url, {'name': 'Science', 'slug': 'science'}).status_code,
			status.HTTP_401_UNAUTHORIZED)

		self.client.force_authenticate(self.student)
		self.assertEqual(
			self.client.post(categories_url, {'name': 'Science', 'slug': 'science'}).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.client.force_authenticate(self.admin)
		create_response = self.client.post(
			categories_url, {'name': 'Science', 'slug': 'science'}, format='json'
		)
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		category_url = reverse('api-v1-category-detail', kwargs={'slug': 'science'})
		self.assertEqual(
			self.client.patch(category_url, {'name': 'Applied Science'}, format='json').status_code,
			status.HTTP_200_OK,
		)
		self.assertEqual(self.client.delete(category_url).status_code, status.HTTP_204_NO_CONTENT)

	def test_course_writes_are_limited_to_owner_or_admin(self):
		course_url = reverse('api-v1-course-detail', kwargs={'slug': self.course.slug})
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(
			self.client.patch(course_url, {'title': 'Hijacked'}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.client.force_authenticate(self.student)
		self.assertEqual(self.client.delete(course_url).status_code, status.HTTP_403_FORBIDDEN)
		self.client.force_authenticate(self.owner)
		self.assertEqual(
			self.client.patch(course_url, {'title': 'Python Basics'}, format='json').status_code,
			status.HTTP_200_OK,
		)
		self.assertEqual(self.client.delete(course_url).status_code, status.HTTP_204_NO_CONTENT)

	def test_sections_are_owner_managed_and_ordered(self):
		sections_url = reverse('api-v1-course-sections', kwargs={'course_slug': self.course.slug})
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(
			self.client.post(sections_url, {'title': 'Other section', 'order': 1}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.client.force_authenticate(self.owner)
		late = self.client.post(
			sections_url, {'title': 'Second', 'order': 2}, format='json'
		)
		first = self.client.post(
			sections_url, {'title': 'First', 'order': 1}, format='json'
		)
		duplicate = self.client.post(
			sections_url, {'title': 'Duplicate order', 'order': 1}, format='json'
		)
		listed = self.client.get(sections_url)

		self.assertEqual(late.status_code, status.HTTP_201_CREATED)
		self.assertEqual(first.status_code, status.HTTP_201_CREATED)
		self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual([item['title'] for item in listed.data['results']], ['First', 'Second'])

		section_url = reverse('api-v1-section-detail', kwargs={'pk': late.data['id']})
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(self.client.delete(section_url).status_code, status.HTTP_403_FORBIDDEN)
		self.client.force_authenticate(self.owner)
		self.assertEqual(self.client.delete(section_url).status_code, status.HTTP_204_NO_CONTENT)

	def test_lessons_are_ordered_and_preview_controls_visibility(self):
		section = Section.objects.create(course=self.course, title='Curriculum', order=1)
		lessons_url = reverse('api-v1-section-lessons', kwargs={'section_pk': section.pk})
		self.client.force_authenticate(self.owner)
		protected = self.client.post(
			lessons_url,
			{'title': 'Protected', 'video_url': 'https://example.com/private', 'order': 2},
			format='json',
		)
		preview = self.client.post(
			lessons_url,
			{
				'title': 'Preview',
				'video_url': 'https://example.com/preview',
				'is_preview': True,
				'order': 1,
			},
			format='json',
		)
		self.assertEqual(protected.status_code, status.HTTP_201_CREATED)
		self.assertEqual(preview.status_code, status.HTTP_201_CREATED)

		public_list = self.client.get(lessons_url)
		self.assertEqual([item['title'] for item in public_list.data['results']], ['Preview', 'Protected'])
		self.client.force_authenticate(None)
		public_list = self.client.get(lessons_url)
		self.assertEqual([item['title'] for item in public_list.data['results']], ['Preview'])
		self.assertEqual(
			self.client.get(
				reverse('api-v1-lesson-detail', kwargs={'pk': protected.data['id']})
			).status_code,
			status.HTTP_401_UNAUTHORIZED,
		)
		self.assertEqual(
			self.client.get(
				reverse('api-v1-lesson-detail', kwargs={'pk': preview.data['id']})
			).status_code,
			status.HTTP_200_OK,
		)

	def test_lesson_update_and_delete_require_course_owner(self):
		section = Section.objects.create(course=self.course, title='Owned', order=1)
		lesson = Lesson.objects.create(course=self.course, section=section, title='Lesson', order=1)
		lesson_url = reverse('api-v1-lesson-detail', kwargs={'pk': lesson.pk})
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(
			self.client.patch(lesson_url, {'title': 'Changed'}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.client.force_authenticate(self.owner)
		self.assertEqual(
			self.client.patch(lesson_url, {'title': 'Changed'}, format='json').status_code,
			status.HTTP_200_OK,
		)
		self.assertEqual(self.client.delete(lesson_url).status_code, status.HTTP_204_NO_CONTENT)

	def test_course_detail_includes_ordered_sections(self):
		Section.objects.create(course=self.course, title='Second', order=2)
		Section.objects.create(course=self.course, title='First', order=1)

		response = self.client.get(
			reverse('api-v1-course-detail', kwargs={'slug': self.course.slug})
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual([item['title'] for item in response.data['sections']], ['First', 'Second'])


class Phase2ResourceApiTests(APITestCase):
	def setUp(self):
		self.temp_media = tempfile.TemporaryDirectory()
		self.addCleanup(self.temp_media.cleanup)
		self.media_override = override_settings(MEDIA_ROOT=self.temp_media.name)
		self.media_override.enable()
		self.addCleanup(self.media_override.disable)
		self.owner = User.objects.create_user(
			username='resource-owner', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.other_instructor = User.objects.create_user(
			username='resource-other', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.student = User.objects.create_user(username='resource-student', password=PASSWORD)
		category = Category.objects.create(name='Resources', slug='resources')
		self.course = Course.objects.create(
			title='Resource Course', slug='resource-course', description='Resources',
			category=category, instructor=self.owner, price='20.00', is_free=False,
		)
		self.preview = Lesson.objects.create(
			course=self.course, title='Preview', is_preview=True, order=1,
		)
		self.protected = Lesson.objects.create(
			course=self.course, title='Protected', is_preview=False, order=2,
		)

	def upload_resource(self, lesson, title='Worksheet'):
		self.client.force_authenticate(self.owner)
		return self.client.post(
			reverse('api-v1-lesson-resources', kwargs={'lesson_pk': lesson.pk}),
			{
				'title': title,
				'order': 1,
				'file': SimpleUploadedFile('worksheet.txt', b'lesson notes'),
			},
			format='multipart',
		)

	def test_protected_resource_requires_entitlement_to_list_and_download(self):
		created = self.upload_resource(self.protected)
		self.assertEqual(created.status_code, status.HTTP_201_CREATED)
		self.assertNotIn('file', created.data)
		self.assertIn('/api/v1/courses/resources/', created.data['download_url'])
		self.client.force_authenticate(self.student)
		self.assertEqual(
			self.client.get(
				reverse('api-v1-lesson-resources', kwargs={'lesson_pk': self.protected.pk})
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.assertEqual(
			self.client.get(
				reverse('api-v1-resource-download', kwargs={'pk': created.data['id']})
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)

		Enrollment.objects.create(student=self.student, course=self.course)
		download = self.client.get(
			reverse('api-v1-resource-download', kwargs={'pk': created.data['id']})
		)
		self.assertEqual(download.status_code, status.HTTP_200_OK)
		self.assertEqual(b''.join(download.streaming_content), b'lesson notes')

	def test_preview_resource_is_public_but_only_owner_can_manage_it(self):
		created = self.upload_resource(self.preview)
		self.assertEqual(created.status_code, status.HTTP_201_CREATED)
		self.client.force_authenticate(None)
		download = self.client.get(
			reverse('api-v1-resource-download', kwargs={'pk': created.data['id']})
		)
		self.assertEqual(download.status_code, status.HTTP_200_OK)
		self.assertEqual(b''.join(download.streaming_content), b'lesson notes')

		resource_url = reverse('api-v1-resource-detail', kwargs={'pk': created.data['id']})
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(self.client.delete(resource_url).status_code, status.HTTP_403_FORBIDDEN)
		self.client.force_authenticate(self.owner)
		self.assertEqual(self.client.delete(resource_url).status_code, status.HTTP_204_NO_CONTENT)

	def test_unenrolled_student_cannot_fetch_protected_lesson(self):
		self.client.force_authenticate(self.student)

		response = self.client.get(reverse('lesson-detail', kwargs={'pk': self.protected.pk}))

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_course_detail_hides_protected_lessons_from_public_users(self):
		response = self.client.get(reverse('course-detail', kwargs={'slug': self.course.slug}))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual([lesson['id'] for lesson in response.data['lessons']], [self.preview.pk])

	def test_enrolled_student_can_fetch_protected_lesson(self):
		Enrollment.objects.create(student=self.student, course=self.course)
		self.client.force_authenticate(self.student)

		response = self.client.get(reverse('lesson-detail', kwargs={'pk': self.protected.pk}))

		self.assertEqual(response.status_code, status.HTTP_200_OK)


class Phase3ProgressDashboardApiTests(APITestCase):
	def setUp(self):
		self.student = User.objects.create_user(username='progress-student', password=PASSWORD)
		self.other_student = User.objects.create_user(username='progress-other', password=PASSWORD)
		self.instructor = User.objects.create_user(
			username='progress-instructor', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		category = Category.objects.create(name='Progress', slug='progress')
		self.course = Course.objects.create(
			title='Progress Course', slug='progress-course', description='Progress tracking',
			category=category, instructor=self.instructor, is_free=True,
		)
		self.other_course = Course.objects.create(
			title='Other Course', slug='other-course', description='Separate course',
			category=category, instructor=self.instructor, is_free=True,
		)
		self.enrollment = Enrollment.objects.create(student=self.student, course=self.course)
		self.other_enrollment = Enrollment.objects.create(student=self.other_student, course=self.course)
		self.lessons = [
			Lesson.objects.create(course=self.course, title=f'Lesson {order}', order=order)
			for order in (1, 2, 3)
		]
		self.foreign_lesson = Lesson.objects.create(
			course=self.other_course, title='Foreign lesson', order=1
		)
		self.progress_url = reverse(
			'api-v1-enrollment-progress', kwargs={'enrollment_pk': self.enrollment.pk}
		)

	def test_progress_updates_percentage_and_completion_authoritatively(self):
		self.client.force_authenticate(self.student)
		initial = self.client.get(self.progress_url)
		self.assertEqual(initial.status_code, status.HTTP_200_OK)
		self.assertEqual(initial.data['progress_percentage'], 0)
		self.assertFalse(self.enrollment.completed)

		for lesson in self.lessons:
			response = self.client.post(
				self.progress_url,
				{'lesson': lesson.pk, 'completed': True},
				format='json',
			)
			self.assertEqual(response.status_code, status.HTTP_200_OK)
			self.assertIsNotNone(response.data['completed_at'])

		completed = self.client.get(self.progress_url)
		self.enrollment.refresh_from_db()
		self.assertEqual(completed.data['completed_lessons'], 3)
		self.assertEqual(completed.data['progress_percentage'], 100)
		self.assertTrue(self.enrollment.completed)
		self.assertEqual(LessonProgress.objects.filter(enrollment=self.enrollment).count(), 3)

		self.client.post(
			self.progress_url,
			{'lesson': self.lessons[0].pk, 'completed': False},
			format='json',
		)
		self.enrollment.refresh_from_db()
		self.assertFalse(self.enrollment.completed)
		self.assertIsNone(
			LessonProgress.objects.get(enrollment=self.enrollment, lesson=self.lessons[0]).completed_at
		)

	def test_student_cannot_read_or_write_another_students_progress(self):
		self.client.force_authenticate(self.other_student)
		self.assertEqual(self.client.get(self.progress_url).status_code, status.HTTP_404_NOT_FOUND)
		self.assertEqual(
			self.client.post(
				self.progress_url,
				{'lesson': self.lessons[0].pk, 'completed': True},
				format='json',
			).status_code,
			status.HTTP_404_NOT_FOUND,
		)

	def test_progress_rejects_lesson_outside_enrolled_course(self):
		self.client.force_authenticate(self.student)

		response = self.client.post(
			self.progress_url,
			{'lesson': self.foreign_lesson.pk, 'completed': True},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(
			LessonProgress.objects.filter(enrollment=self.enrollment).exists()
		)

	def test_dashboard_returns_only_students_courses_progress_and_certificate_placeholder(self):
		self.client.force_authenticate(self.student)
		self.client.post(
			self.progress_url,
			{'lesson': self.lessons[0].pk, 'completed': True},
			format='json',
		)

		response = self.client.get(reverse('api-v1-student-dashboard'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['my_courses']), 1)
		course_data = response.data['my_courses'][0]
		self.assertEqual(course_data['course_id'], self.course.pk)
		self.assertEqual(course_data['completed_lessons'], 1)
		self.assertEqual(course_data['progress_percentage'], 33.33)
		self.assertEqual(response.data['certificates'], [])
		self.assertEqual(response.data['pagination']['count'], 1)

	def test_dashboard_requires_authentication(self):
		response = self.client.get(reverse('api-v1-student-dashboard'))
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class Phase3CourseReviewApiTests(APITestCase):
	def setUp(self):
		self.student = User.objects.create_user(username='review-student', password=PASSWORD)
		self.other_student = User.objects.create_user(username='review-other', password=PASSWORD)
		self.instructor = User.objects.create_user(
			username='review-instructor', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		category = Category.objects.create(name='Reviews', slug='reviews')
		self.course = Course.objects.create(
			title='Review Course', slug='review-course', description='Review test course',
			category=category, instructor=self.instructor, is_free=True,
		)
		self.enrollment = Enrollment.objects.create(student=self.student, course=self.course)
		self.reviews_url = reverse(
			'api-v1-course-reviews', kwargs={'course_slug': self.course.slug}
		)

	def test_enrolled_student_can_create_and_list_review(self):
		self.client.force_authenticate(self.student)

		created = self.client.post(
			self.reviews_url,
			{'rating': 5, 'comment': 'Excellent course.'},
			format='json',
		)
		listed = self.client.get(self.reviews_url)

		self.assertEqual(created.status_code, status.HTTP_201_CREATED)
		self.assertEqual(created.data['rating'], 5)
		self.assertEqual(listed.status_code, status.HTTP_200_OK)
		self.assertEqual(listed.data['count'], 1)
		self.assertEqual(CourseReview.objects.filter(course=self.course, student=self.student).count(), 1)

	def test_unenrolled_student_cannot_review_but_public_can_read(self):
		self.client.force_authenticate(self.other_student)
		response = self.client.post(
			self.reviews_url, {'rating': 4, 'comment': 'Good.'}, format='json'
		)
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

		self.client.force_authenticate(None)
		self.assertEqual(self.client.get(self.reviews_url).status_code, status.HTTP_200_OK)
		self.assertEqual(
			self.client.post(
				self.reviews_url, {'rating': 4, 'comment': 'Good.'}, format='json'
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)

	def test_student_can_submit_only_one_review_per_course(self):
		self.client.force_authenticate(self.student)
		payload = {'rating': 4, 'comment': 'Good course.'}
		first = self.client.post(self.reviews_url, payload, format='json')
		second = self.client.post(self.reviews_url, payload, format='json')

		self.assertEqual(first.status_code, status.HTTP_201_CREATED)
		self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(CourseReview.objects.filter(course=self.course).count(), 1)

	def test_rating_validation_and_aggregate(self):
		self.client.force_authenticate(self.student)
		invalid = self.client.post(
			self.reviews_url, {'rating': 6, 'comment': 'Invalid.'}, format='json'
		)
		self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)

		CourseReview.objects.create(course=self.course, student=self.student, rating=4)
		course = self.client.get(reverse('api-v1-course-detail', kwargs={'slug': self.course.slug}))
		self.assertEqual(course.data['average_rating'], 4.0)
		self.assertEqual(course.data['review_count'], 1)

	def test_only_review_owner_or_admin_can_modify_review(self):
		review = CourseReview.objects.create(course=self.course, student=self.student, rating=4)
		review_url = reverse('api-v1-review-detail', kwargs={'pk': review.pk})
		self.client.force_authenticate(self.other_student)
		self.assertEqual(
			self.client.patch(review_url, {'rating': 2}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.client.force_authenticate(self.student)
		self.assertEqual(
			self.client.patch(review_url, {'rating': 5}, format='json').status_code,
			status.HTTP_200_OK,
		)


class Phase5QuizApiTests(APITestCase):
	def setUp(self):
		self.owner = User.objects.create_user(
			username='quiz-owner', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.other_instructor = User.objects.create_user(
			username='quiz-other', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.student = User.objects.create_user(username='quiz-student', password=PASSWORD)
		self.other_student = User.objects.create_user(username='quiz-other-student', password=PASSWORD)
		category = Category.objects.create(name='Assessments', slug='assessments')
		self.course = Course.objects.create(
			title='Quiz Course', slug='quiz-course', description='Quiz tests',
			category=category, instructor=self.owner, is_free=True,
		)
		Enrollment.objects.create(student=self.student, course=self.course)
		self.quiz = Quiz.objects.create(
			course=self.course, title='Knowledge Check', max_attempts=1,
		)
		self.single_question = Question.objects.create(
			quiz=self.quiz, prompt='Select the correct answer.', order=1, points=Decimal('2.00')
		)
		self.single_correct = Choice.objects.create(
			question=self.single_question, text='Correct', is_correct=True, order=1
		)
		self.single_wrong = Choice.objects.create(
			question=self.single_question, text='Incorrect', is_correct=False, order=2
		)
		self.multiple_question = Question.objects.create(
			quiz=self.quiz, prompt='Select both correct answers.', order=2,
			points=Decimal('3.00'), allow_multiple=True,
		)
		self.multiple_correct_a = Choice.objects.create(
			question=self.multiple_question, text='Correct A', is_correct=True, order=1
		)
		self.multiple_correct_b = Choice.objects.create(
			question=self.multiple_question, text='Correct B', is_correct=True, order=2
		)
		self.multiple_wrong = Choice.objects.create(
			question=self.multiple_question, text='Incorrect', is_correct=False, order=3
		)
		self.quiz_url = reverse('api-v1-quiz-detail', kwargs={'pk': self.quiz.pk})
		self.attempts_url = reverse('api-v1-quiz-attempts', kwargs={'quiz_pk': self.quiz.pk})

	def test_only_enrolled_students_can_access_and_attempt_quiz(self):
		self.client.force_authenticate(self.other_student)
		self.assertEqual(self.client.get(self.quiz_url).status_code, status.HTTP_403_FORBIDDEN)
		self.assertEqual(
			self.client.post(self.attempts_url, {'answers': []}, format='json').status_code,
			status.HTTP_404_NOT_FOUND,
		)

		self.client.force_authenticate(self.student)
		self.assertEqual(self.client.get(self.quiz_url).status_code, status.HTTP_200_OK)

	def test_student_quiz_responses_never_expose_correct_answers(self):
		self.client.force_authenticate(self.student)
		quiz_response = self.client.get(self.quiz_url)
		questions_response = self.client.get(
			reverse('api-v1-quiz-questions', kwargs={'quiz_pk': self.quiz.pk})
		)
		choices_response = self.client.get(
			reverse(
				'api-v1-question-choices',
				kwargs={'question_pk': self.single_question.pk},
			)
		)

		self.assertEqual(quiz_response.status_code, status.HTTP_200_OK)
		for question in quiz_response.data['questions']:
			for choice in question['choices']:
				self.assertNotIn('is_correct', choice)
		for question in questions_response.data['results']:
			for choice in question['choices']:
				self.assertNotIn('is_correct', choice)
		for choice in choices_response.data['results']:
			self.assertNotIn('is_correct', choice)

		self.client.force_authenticate(self.owner)
		instructor_response = self.client.get(self.quiz_url)
		self.assertTrue(
			any('is_correct' in choice for question in instructor_response.data['questions']
				for choice in question['choices'])
		)

	def test_quiz_is_graded_server_side_and_results_are_stored(self):
		self.client.force_authenticate(self.student)
		response = self.client.post(
			self.attempts_url,
			{
				'answers': [
					{'question': self.single_question.pk, 'choices': [self.single_correct.pk]},
					{
						'question': self.multiple_question.pk,
						'choices': [self.multiple_correct_a.pk, self.multiple_correct_b.pk],
					},
				],
				'score': '999.00',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Decimal(response.data['score']), Decimal('5.00'))
		self.assertEqual(Decimal(response.data['total_points']), Decimal('5.00'))
		self.assertNotIn('answers', response.data)
		self.assertNotIn('is_correct', response.data)
		attempt = QuizAttempt.objects.get(pk=response.data['id'])
		self.assertEqual(attempt.student, self.student)
		self.assertEqual(attempt.answers[0]['choices'], [self.single_correct.pk])
		self.assertEqual(attempt.score, Decimal('5.00'))

	def test_incorrect_answers_receive_no_credit_and_attempt_limit_is_enforced(self):
		self.client.force_authenticate(self.student)
		first = self.client.post(
			self.attempts_url,
			{
				'answers': [
					{'question': self.single_question.pk, 'choices': [self.single_wrong.pk]},
					{
						'question': self.multiple_question.pk,
						'choices': [self.multiple_correct_a.pk],
					},
				]
			},
			format='json',
		)
		second = self.client.post(self.attempts_url, {'answers': []}, format='json')

		self.assertEqual(first.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Decimal(first.data['score']), Decimal('0.00'))
		self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(QuizAttempt.objects.filter(quiz=self.quiz, student=self.student).count(), 1)

	def test_non_owner_instructor_cannot_create_or_edit_quiz_content(self):
		self.client.force_authenticate(self.other_instructor)
		course_quizzes = reverse(
			'api-v1-course-quizzes', kwargs={'course_slug': self.course.slug}
		)
		self.assertEqual(
			self.client.post(
				course_quizzes,
				{'title': 'Unauthorized', 'max_attempts': 1},
				format='json',
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		self.assertEqual(
			self.client.patch(self.quiz_url, {'title': 'Changed'}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)
		questions_url = reverse('api-v1-quiz-questions', kwargs={'quiz_pk': self.quiz.pk})
		self.assertEqual(
			self.client.post(
				questions_url,
				{'prompt': 'Unauthorized', 'order': 3, 'points': '1.00'},
				format='json',
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.owner)
		self.assertEqual(
			self.client.post(
				questions_url,
				{'prompt': 'Owner question', 'order': 3, 'points': '1.00'},
				format='json',
			).status_code,
			status.HTTP_201_CREATED,
		)


class Phase5AssignmentApiTests(APITestCase):
	def setUp(self):
		self.owner = User.objects.create_user(
			username='assignment-owner', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.other_instructor = User.objects.create_user(
			username='assignment-other', password=PASSWORD,
			is_student=False, is_instructor=True, is_verified_instructor=True,
		)
		self.student = User.objects.create_user(username='assignment-student', password=PASSWORD)
		self.other_student = User.objects.create_user(username='assignment-other-student', password=PASSWORD)
		category = Category.objects.create(name='Assignments', slug='assignments')
		self.course = Course.objects.create(
			title='Assignment Course', slug='assignment-course', description='Assignment tests',
			category=category, instructor=self.owner, is_free=True,
		)
		Enrollment.objects.create(student=self.student, course=self.course)
		self.assignment = Assignment.objects.create(
			course=self.course,
			title='Short essay',
			description='Write a short essay.',
			due_at=timezone.now() + timedelta(days=1),
			max_points=Decimal('10.00'),
		)
		self.assignments_url = reverse(
			'api-v1-course-assignments', kwargs={'course_slug': self.course.slug}
		)
		self.submissions_url = reverse(
			'api-v1-assignment-submissions', kwargs={'assignment_pk': self.assignment.pk}
		)

	def test_only_enrolled_students_can_submit_and_duplicate_or_late_submissions_fail(self):
		self.client.force_authenticate(self.other_student)
		self.assertEqual(
			self.client.post(self.submissions_url, {'content': 'answer'}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.student)
		first = self.client.post(self.submissions_url, {'content': 'answer'}, format='json')
		duplicate = self.client.post(self.submissions_url, {'content': 'second answer'}, format='json')
		self.assertEqual(first.status_code, status.HTTP_201_CREATED)
		self.assertIsNone(first.data['grade'])
		self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(AssignmentSubmission.objects.filter(assignment=self.assignment).count(), 1)

		late_assignment = Assignment.objects.create(
			course=self.course,
			title='Late task',
			description='Already closed.',
			due_at=timezone.now() - timedelta(seconds=1),
		)
		late_url = reverse(
			'api-v1-assignment-submissions', kwargs={'assignment_pk': late_assignment.pk}
		)
		late = self.client.post(late_url, {'content': 'too late'}, format='json')
		self.assertEqual(late.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertFalse(AssignmentSubmission.objects.filter(assignment=late_assignment).exists())

	def test_course_owner_can_create_and_grade_but_other_instructors_and_students_cannot(self):
		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(
			self.client.post(
				self.assignments_url,
				{'title': 'Unauthorized', 'description': 'No', 'max_points': '10.00'},
				format='json',
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)
		assignment_url = reverse('api-v1-assignment-detail', kwargs={'pk': self.assignment.pk})
		self.assertEqual(
			self.client.patch(assignment_url, {'title': 'Changed'}, format='json').status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.student)
		submission = self.client.post(
			self.submissions_url, {'content': 'My work'}, format='json'
		)
		submission_url = reverse(
			'api-v1-assignment-submission-detail', kwargs={'pk': submission.data['id']}
		)
		self.assertEqual(
			self.client.patch(
				submission_url, {'grade': '8.00', 'feedback': 'Good work.'}, format='json'
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.other_instructor)
		self.assertEqual(
			self.client.patch(
				submission_url, {'grade': '8.00', 'feedback': 'Good work.'}, format='json'
			).status_code,
			status.HTTP_403_FORBIDDEN,
		)

		self.client.force_authenticate(self.owner)
		graded = self.client.patch(
			submission_url, {'grade': '8.00', 'feedback': 'Good work.'}, format='json'
		)
		self.assertEqual(graded.status_code, status.HTTP_200_OK)
		self.assertEqual(graded.data['grade'], '8.00')
		self.assertEqual(graded.data['feedback'], 'Good work.')
		stored_submission = AssignmentSubmission.objects.get(pk=submission.data['id'])
		self.assertEqual(stored_submission.graded_by, self.owner)
		too_high = self.client.patch(
			submission_url, {'grade': '11.00'}, format='json'
		)
		self.assertEqual(too_high.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(
			stored_submission.grade,
			Decimal('8.00'),
		)
