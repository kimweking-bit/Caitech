from datetime import timedelta
from io import BytesIO
import tempfile

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from courses.models import Category, Course

from .models import (
    BlogCategory,
    ContactInquiry,
    NewsletterSubscription,
    Post,
    Tag,
)


PASSWORD = 'R4ndom-Password!Value-2026'


class SiteContentTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff = User.objects.create_user(
            username='content-staff', password=PASSWORD, is_staff=True,
        )
        self.student = User.objects.create_user(username='content-student', password=PASSWORD)


class BlogApiTests(SiteContentTestCase):
    def setUp(self):
        super().setUp()
        self.temp_media = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_media.cleanup)
        self.media_override = override_settings(MEDIA_ROOT=self.temp_media.name)
        self.media_override.enable()
        self.addCleanup(self.media_override.disable)
        self.category = BlogCategory.objects.create(name='Campus', slug='campus')
        self.tag = Tag.objects.create(name='News', slug='news')
        self.published = Post.objects.create(
            title='Welcome to Caitech',
            slug='welcome-to-caitech',
            excerpt='A look at the college.',
            body='Long-form campus news.',
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(days=1),
        )
        self.published.categories.add(self.category)
        self.published.tags.add(self.tag)
        self.draft = Post.objects.create(
            title='Unpublished announcement',
            slug='unpublished-announcement',
            excerpt='An internal announcement.',
            body='Not for the public.',
            status=Post.Status.DRAFT,
        )
        self.posts_url = reverse('api-v1-blog-post-list')

    def test_public_blog_list_and_detail_only_expose_published_posts(self):
        listing = self.client.get(self.posts_url)
        detail = self.client.get(
            reverse('api-v1-blog-post-detail', kwargs={'slug': self.published.slug})
        )
        draft = self.client.get(
            reverse('api-v1-blog-post-detail', kwargs={'slug': self.draft.slug})
        )

        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(listing.data['count'], 1)
        self.assertEqual(listing.data['results'][0]['slug'], self.published.slug)
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data['categories'], ['campus'])
        self.assertEqual(detail.data['tags'], ['news'])
        self.assertEqual(draft.status_code, status.HTTP_404_NOT_FOUND)

    def test_only_staff_can_create_edit_or_delete_posts(self):
        payload = {
            'title': 'New story',
            'slug': 'new-story',
            'excerpt': 'A short summary.',
            'body': 'A complete article body.',
            'status': 'draft',
            'categories': ['campus'],
            'tags': ['news'],
        }
        self.assertEqual(
            self.client.post(self.posts_url, payload, format='json').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        self.client.force_authenticate(self.student)
        self.assertEqual(
            self.client.post(self.posts_url, payload, format='json').status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.client.force_authenticate(self.staff)
        created = self.client.post(self.posts_url, payload, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        detail_url = reverse('api-v1-blog-post-detail', kwargs={'slug': 'new-story'})
        updated = self.client.patch(detail_url, {'title': 'Updated story'}, format='json')
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data['title'], 'Updated story')
        self.assertEqual(self.client.delete(detail_url).status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_upload_featured_image(self):
        image_buffer = BytesIO()
        Image.new('RGB', (1, 1), color='white').save(image_buffer, format='PNG')
        image = SimpleUploadedFile(
            'featured.png',
            image_buffer.getvalue(),
            content_type='image/png',
        )
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            self.posts_url,
            {
                'title': 'Image story',
                'slug': 'image-story',
                'excerpt': 'A story with an image.',
                'body': 'Article content.',
                'featured_image': image,
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['featured_image'].endswith('.png'))


class NewsletterApiTests(SiteContentTestCase):
    def setUp(self):
        super().setUp()
        self.subscribe_url = reverse('api-v1-newsletter-subscribe')

    def test_subscription_validates_email_and_rejects_case_insensitive_duplicates(self):
        invalid = self.client.post(self.subscribe_url, {'email': 'bad-address'}, format='json')
        first = self.client.post(
            self.subscribe_url, {'email': 'Student@Example.com'}, format='json'
        )
        duplicate = self.client.post(
            self.subscribe_url, {'email': 'student@example.com'}, format='json'
        )

        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first.data['email'], 'student@example.com')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(NewsletterSubscription.objects.count(), 1)

    def test_subscription_list_is_admin_only(self):
        url = reverse('api-v1-newsletter-subscriptions')
        self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

    def test_newsletter_subscription_is_throttled(self):
        cache.clear()
        for index in range(5):
            response = self.client.post(
                self.subscribe_url,
                {'email': f'rate-{index}@example.com'},
                format='json',
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            self.client.post(
                self.subscribe_url, {'email': 'rate-sixth@example.com'}, format='json'
            ).status_code,
            status.HTTP_429_TOO_MANY_REQUESTS,
        )


class ContactApiTests(SiteContentTestCase):
    def setUp(self):
        super().setUp()
        category = Category.objects.create(name='Programs', slug='programs')
        self.course = Course.objects.create(
            title='College Diploma', slug='college-diploma', description='Course details.',
            category=category, instructor=self.staff, course_type='diploma',
        )
        self.contact_url = reverse('api-v1-contact-submit')
        self.valid_payload = {
            'name': 'Jane Student',
            'email': 'jane@example.com',
            'phone': '+254 700 123 456',
            'message': 'Please send me more details about this course.',
            'course': self.course.pk,
        }

    def test_contact_form_validates_and_stores_optional_course(self):
        response = self.client.post(self.contact_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        inquiry = ContactInquiry.objects.get()
        self.assertEqual(inquiry.name, 'Jane Student')
        self.assertEqual(inquiry.course, self.course)
        self.assertEqual(inquiry.email, self.valid_payload['email'])

        without_course = self.client.post(
            self.contact_url,
            {key: value for key, value in self.valid_payload.items() if key != 'course'},
            format='json',
        )
        self.assertEqual(without_course.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(ContactInquiry.objects.order_by('-pk').first().course)

        invalid = self.client.post(
            self.contact_url,
            {**self.valid_payload, 'email': 'not-an-email'},
            format='json',
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ContactInquiry.objects.count(), 2)

    def test_contact_rejects_short_message_and_discards_honeypot(self):
        short_message = self.client.post(
            self.contact_url,
            {**self.valid_payload, 'message': 'Hi'},
            format='json',
        )
        invalid_phone = self.client.post(
            self.contact_url,
            {**self.valid_payload, 'phone': 'call-me'},
            format='json',
        )
        spam = self.client.post(
            self.contact_url,
            {**self.valid_payload, 'website': 'bot-filled-field'},
            format='json',
        )
        self.assertEqual(short_message.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(invalid_phone.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(spam.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(ContactInquiry.objects.count(), 0)

    def test_inquiry_list_is_admin_only(self):
        url = reverse('api-v1-contact-inquiries')
        self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

    def test_contact_form_is_throttled(self):
        cache.clear()
        for index in range(5):
            response = self.client.post(
                self.contact_url,
                {**self.valid_payload, 'email': f'contact-{index}@example.com'},
                format='json',
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            self.client.post(
                self.contact_url,
                {**self.valid_payload, 'email': 'contact-sixth@example.com'},
                format='json',
            ).status_code,
            status.HTTP_429_TOO_MANY_REQUESTS,
        )


class CourseMarketingApiTests(SiteContentTestCase):
    def setUp(self):
        super().setUp()
        category = Category.objects.create(name='College Programs', slug='college-programs')
        self.diploma = Course.objects.create(
            title='Business Diploma', slug='business-diploma', description='Diploma details.',
            category=category, instructor=self.staff, course_type='diploma',
            duration='6 Semesters', delivery_modes=['online', 'recorded'],
            intake_status='upcoming', whatsapp_inquiry_url='https://wa.me/254700123456',
        )
        self.certificate = Course.objects.create(
            title='Design Certificate', slug='design-certificate', description='Certificate details.',
            category=category, instructor=self.staff, course_type='certificate',
            duration='2 Semesters', delivery_modes=['physical'], intake_status='ongoing',
        )
        self.courses_url = reverse('api-v1-course-list')

    def test_course_fields_are_public_and_filterable(self):
        listing = self.client.get(self.courses_url)
        diploma_filter = self.client.get(self.courses_url, {'course_type': 'diploma'})
        delivery_filter = self.client.get(self.courses_url, {'delivery_mode': 'recorded'})
        physical_filter = self.client.get(self.courses_url, {'delivery_mode': 'physical'})

        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(listing.data['count'], 2)
        course_data = next(
            item for item in listing.data['results'] if item['slug'] == self.diploma.slug
        )
        self.assertEqual(course_data['course_type'], 'diploma')
        self.assertEqual(course_data['duration'], '6 Semesters')
        self.assertCountEqual(course_data['delivery_modes'], ['online', 'recorded'])
        self.assertEqual(course_data['intake_status'], 'upcoming')
        self.assertEqual(course_data['whatsapp_inquiry_url'], 'https://wa.me/254700123456')
        self.assertEqual(diploma_filter.data['count'], 1)
        self.assertEqual(delivery_filter.data['count'], 1)
        self.assertEqual(delivery_filter.data['results'][0]['id'], self.diploma.pk)
        self.assertEqual(physical_filter.data['results'][0]['id'], self.certificate.pk)

    def test_course_filters_reject_unknown_values(self):
        invalid_type = self.client.get(self.courses_url, {'course_type': 'degree'})
        invalid_mode = self.client.get(self.courses_url, {'delivery_mode': 'hybrid'})
        self.assertEqual(invalid_type.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('course_type', invalid_type.data)
        self.assertEqual(invalid_mode.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('delivery_mode', invalid_mode.data)
