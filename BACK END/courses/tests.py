from unittest.mock import patch
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Course, Enrollment, Lesson, Section


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
