from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase, override_settings
from rest_framework.exceptions import ValidationError

from payments.models import CartItem, Order, PaymentTransaction

from .models import Category, Course, Enrollment, Lesson, Section

User = get_user_model()
PASSWORD = 'R4ndom-Password!Value-2026'


@override_settings(
    MPESA_CALLBACK_SECRET='storefront-test-secret',
    STORAGES={
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    },
)
class StorefrontTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Technology', slug='technology')
        self.instructor = User.objects.create_user(
            username='storefront-instructor',
            password=PASSWORD,
            is_student=False,
            is_instructor=True,
            is_verified_instructor=True,
        )
        self.student = User.objects.create_user(
            username='storefront-student',
            password=PASSWORD,
            email='student@example.test',
            first_name='Kai',
            last_name='Learner',
            phone_number='0712345678',
        )
        self.course = self.make_course('web-foundations')

    def make_course(self, slug, *, price='120.00', published=True):
        return Course.objects.create(
            title=f'Course {slug}',
            slug=slug,
            short_description='Practical skills for your next step.',
            description='Course details and outcomes.',
            category=self.category,
            instructor=self.instructor,
            price=price,
            currency=Course.Currency.KES,
            is_published=published,
            level=Course.Level.BEGINNER,
            duration='6 weeks',
        )

    def test_catalog_and_course_detail_render_course_information(self):
        catalog_response = self.client.get(reverse('storefront-catalog'))
        detail_response = self.client.get(
            reverse('storefront-course-detail', kwargs={'slug': self.course.slug})
        )

        self.assertEqual(catalog_response.status_code, 200)
        self.assertContains(catalog_response, 'Buy course')
        self.assertContains(catalog_response, 'KES 120')
        self.assertEqual(detail_response.status_code, 200)
        self.assertContains(detail_response, self.course.title)
        self.assertContains(detail_response, '6 weeks')

    def test_unpublished_course_is_not_publicly_listed_or_opened(self):
        hidden = self.make_course('draft-course', published=False)

        catalog_response = self.client.get(reverse('storefront-catalog'))
        detail_response = self.client.get(
            reverse('storefront-course-detail', kwargs={'slug': hidden.slug})
        )

        self.assertNotContains(catalog_response, hidden.title)
        self.assertEqual(detail_response.status_code, 404)

    def test_guest_cart_persists_and_prevents_duplicate_line_items(self):
        add_url = reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk})

        self.client.post(add_url)
        self.client.post(add_url)
        response = self.client.get(reverse('storefront-cart'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.course.title)
        self.assertEqual(response.context['cart_count'], 1)

        self.client.post(reverse('storefront-remove-from-cart', kwargs={'course_id': self.course.pk}))
        response = self.client.get(reverse('storefront-cart'))
        self.assertContains(response, 'Your cart is waiting.')

    def test_guest_cart_is_merged_after_login(self):
        self.client.post(reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk}))

        response = self.client.post(reverse('storefront-login'), {
            'username': self.student.username,
            'password': PASSWORD,
            'next': reverse('storefront-checkout'),
        })

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('storefront-checkout'))
        self.assertEqual(CartItem.objects.filter(cart__user=self.student, course=self.course).count(), 1)

    def test_checkout_requires_authentication_and_prefills_customer_details(self):
        guest_response = self.client.get(reverse('storefront-checkout'))
        self.assertEqual(guest_response.status_code, 302)
        self.client.force_login(self.student)
        self.client.post(reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk}))

        checkout_response = self.client.get(reverse('storefront-checkout'))

        self.assertEqual(checkout_response.status_code, 200)
        self.assertContains(checkout_response, 'value="Kai Learner"')
        self.assertContains(checkout_response, 'value="student@example.test"')
        self.assertContains(checkout_response, 'value="0712345678"')

    def test_checkout_creates_pending_order_and_starts_mpesa(self):
        self.client.force_login(self.student)
        self.client.post(reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk}))
        provider = Mock()
        provider.initiate_payment.return_value = {
            'provider_reference': 'sandbox-stk-reference',
            'redirect_url': '',
        }

        with patch('payments.services.get_provider', return_value=provider):
            response = self.client.post(reverse('storefront-checkout'), {
                'full_name': 'Kai Learner',
                'email': 'billing@example.test',
                'phone_number': '0712345678',
                'payment_method': 'mpesa',
            })

        order = Order.objects.get(user=self.student)
        payment = PaymentTransaction.objects.get(order=order)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse(
            'storefront-payment-return', kwargs={'order_reference': order.reference}
        ))
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.customer_email, 'billing@example.test')
        self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)
        self.assertEqual(payment.phone_number, '0712345678')
        self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())
        self.assertEqual(CartItem.objects.filter(cart__user=self.student).count(), 0)

    def test_invalid_checkout_phone_does_not_create_order(self):
        self.client.force_login(self.student)
        self.client.post(reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk}))

        response = self.client.post(reverse('storefront-checkout'), {
            'full_name': 'Kai Learner',
            'email': 'billing@example.test',
            'phone_number': 'not-a-phone',
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.assertContains(response, 'valid Kenyan phone number', status_code=400)

    def test_free_course_enrollment_and_dashboard_access(self):
        free_course = self.make_course('free-course', price='0.00')
        section = Section.objects.create(course=free_course, title='Getting started')
        Lesson.objects.create(course=free_course, section=section, title='Welcome lesson')
        self.client.force_login(self.student)

        enrollment_response = self.client.post(
            reverse('storefront-free-enroll', kwargs={'slug': free_course.slug})
        )
        dashboard_response = self.client.get(reverse('storefront-dashboard'))
        room_response = self.client.get(
            reverse('storefront-course-room', kwargs={'slug': free_course.slug})
        )

        self.assertEqual(enrollment_response.status_code, 302)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=free_course).exists())
        self.assertContains(dashboard_response, free_course.title)
        self.assertContains(room_response, 'Welcome lesson')

    def test_paid_course_content_is_denied_until_enrolled(self):
        section = Section.objects.create(course=self.course, title='Module one')
        Lesson.objects.create(course=self.course, section=section, title='Private lesson')
        self.client.force_login(self.student)

        response = self.client.get(reverse('storefront-course-room', kwargs={'slug': self.course.slug}))

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('storefront-course-detail', kwargs={'slug': self.course.slug}))
        self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

    def test_enrolled_student_gets_paid_course_room(self):
        section = Section.objects.create(course=self.course, title='Module one')
        Lesson.objects.create(course=self.course, section=section, title='Private lesson')
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_login(self.student)

        response = self.client.get(reverse('storefront-course-room', kwargs={'slug': self.course.slug}))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Private lesson')

    def test_owned_course_cannot_be_added_or_ordered_again(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_login(self.student)

        response = self.client.post(
            reverse('storefront-add-to-cart', kwargs={'course_id': self.course.pk})
        )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(CartItem.objects.filter(cart__user=self.student).count(), 0)
        with self.assertRaises(ValidationError):
            from payments.services import create_course_order_for_courses
            create_course_order_for_courses(user=self.student, courses=[self.course])