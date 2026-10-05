import hashlib
import hmac
import json
from datetime import timedelta
from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.test import APITestCase

from courses.models import Category, Course, CourseReview, Enrollment, Lesson

from .models import Coupon, Order, PaymentTransaction
from .providers import callback_token
from .services import create_course_order_for_courses, expire_order_if_stale

User = get_user_model()
PASSWORD = 'R4ndom-Password!Value-2026'


@override_settings(
    MPESA_CALLBACK_SECRET='test-mpesa-callback-secret',
    CARD_HOSTED_CHECKOUT_URL='https://checkout.example.test/card',
    CARD_WEBHOOK_SECRET='test-card-webhook-secret',
    PAYPAL_HOSTED_CHECKOUT_URL='https://checkout.example.test/paypal',
    PAYPAL_WEBHOOK_SECRET='test-paypal-webhook-secret',
)
class PaymentFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='buyer', email='buyer@example.test', password=PASSWORD
        )
        self.client.force_authenticate(self.user)
        self.category = Category.objects.create(name='Technology', slug='technology')
        self.course = self.make_course('paid-course')

    def make_course(self, slug, *, price='120.00', is_free=False):
        instructor = User.objects.create_user(
            username=f'instructor-{slug}',
            password=PASSWORD,
            is_student=False,
            is_instructor=True,
            is_verified_instructor=True,
        )
        return Course.objects.create(
            title=f'Course {slug}',
            slug=slug,
            description='Course description',
            category=self.category,
            instructor=instructor,
            price=price,
            is_free=is_free,
            currency=Course.Currency.KES,
        )

    def create_order(self, *, course=None, coupon_code=None):
        payload = {'course_id': (course or self.course).pk}
        if coupon_code is not None:
            payload['coupon_code'] = coupon_code
        return self.client.post(reverse('payments-order-create'), payload, format='json')

    def initiate(self, order_reference, method='mpesa'):
        provider = Mock()
        provider.initiate_payment.return_value = {
            'provider_reference': f'{method}-provider-reference',
            'redirect_url': f'https://checkout.example.test/{method}/session',
        }
        payload = {'method': method}
        if method == 'mpesa':
            payload['phone_number'] = '0712345678'
        with patch('payments.services.get_provider', return_value=provider):
            response = self.client.post(
                reverse('payments-order-initiate', kwargs={'order_reference': order_reference}),
                payload,
                format='json',
            )
        return response, provider

    def mpesa_callback(self, payment, *, result_code=0, amount='120.00', token=None):
        callback = {
            'CheckoutRequestID': payment.provider_reference,
            'ResultCode': result_code,
        }
        if result_code == 0:
            callback['CallbackMetadata'] = {'Item': [
                {'Name': 'Amount', 'Value': amount},
                {'Name': 'MpesaReceiptNumber', 'Value': 'QAB1234567'},
            ]}
        path = reverse('payments-mpesa-callback', kwargs={
            'transaction_reference': payment.reference,
            'token': token or callback_token(payment),
        })
        return self.client.post(path, {'Body': {'stkCallback': callback}}, format='json')

    def hosted_callback(self, payment, provider, **overrides):
        payload = {
            'transaction_reference': str(payment.reference),
            'order_reference': str(payment.order.reference),
            'provider_reference': payment.provider_reference,
            'amount': str(payment.amount),
            'currency': payment.currency,
            'status': PaymentTransaction.Status.CONFIRMED,
        }
        payload.update(overrides)
        raw_body = json.dumps(payload, separators=(',', ':')).encode()
        secret = f'test-{provider}-webhook-secret'.encode()
        signature = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
        return self.client.generic(
            'POST',
            reverse('payments-hosted-callback', kwargs={'provider': provider}),
            raw_body,
            content_type='application/json',
            HTTP_X_PROVIDER_SIGNATURE=signature,
        )

    def test_successful_mpesa_payment_enrols_and_sends_confirmation(self):
        order_response = self.create_order()
        response, _ = self.initiate(order_response.data['reference'])
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        callback = self.mpesa_callback(payment)

        payment.refresh_from_db()
        order = Order.objects.get(pk=payment.order_id)
        self.assertEqual(callback.status_code, status.HTTP_200_OK)
        self.assertEqual(payment.status, PaymentTransaction.Status.CONFIRMED)
        self.assertEqual(order.status, Order.Status.PAID)
        self.assertTrue(Enrollment.objects.filter(student=self.user, course=self.course).exists())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('CAI Technologies', mail.outbox[0].body)

    def test_failed_mpesa_payment_does_not_enrol(self):
        order = self.create_order().data
        response, _ = self.initiate(order['reference'])
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        callback = self.mpesa_callback(payment, result_code=1032)

        payment.refresh_from_db()
        self.assertEqual(callback.status_code, status.HTTP_200_OK)
        self.assertEqual(payment.status, PaymentTransaction.Status.FAILED)
        self.assertEqual(payment.order.status, Order.Status.FAILED)
        self.assertFalse(Enrollment.objects.filter(student=self.user, course=self.course).exists())

    def test_duplicate_mpesa_callback_does_not_duplicate_enrollment_or_email(self):
        order = self.create_order().data
        response, _ = self.initiate(order['reference'])
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        first = self.mpesa_callback(payment)
        second = self.mpesa_callback(payment)

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertTrue(second.data['duplicate'])
        self.assertEqual(Enrollment.objects.filter(student=self.user, course=self.course).count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_wrong_amount_and_invalid_callback_token_are_rejected(self):
        order = self.create_order().data
        response, _ = self.initiate(order['reference'])
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        wrong_amount = self.mpesa_callback(payment, amount='119.00')
        invalid_token = self.mpesa_callback(payment, token='invalid-token')

        payment.refresh_from_db()
        self.assertEqual(wrong_amount.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(invalid_token.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)
        self.assertFalse(Enrollment.objects.filter(student=self.user, course=self.course).exists())

    def test_invalid_coupon_is_rejected(self):
        response = self.create_order(coupon_code='NOT-A-COUPON')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)

    def test_coupon_discount_is_server_calculated_and_snapshotted(self):
        Coupon.objects.create(
            code='SAVE25', discount_type=Coupon.DiscountType.PERCENTAGE, amount='25.00'
        )

        response = self.create_order(coupon_code='save25')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subtotal'], '120.00')
        self.assertEqual(response.data['discount_amount'], '30.00')
        self.assertEqual(response.data['total'], '90.00')
        order = Order.objects.get(reference=response.data['reference'])
        self.assertEqual(order.items.get().unit_price, Decimal('120.00'))
        self.assertEqual(order.coupon_code, 'SAVE25')

    def test_free_course_enrolls_without_a_transaction(self):
        free_course = self.make_course('free-course', price='0.00', is_free=True)

        response = self.create_order(course=free_course)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], Order.Status.PAID)
        self.assertEqual(response.data['total'], '0.00')
        self.assertEqual(PaymentTransaction.objects.count(), 0)
        self.assertTrue(Enrollment.objects.filter(student=self.user, course=free_course).exists())

    def test_card_and_paypal_use_hosted_mock_providers_and_signed_callbacks(self):
        for method in ('card', 'paypal'):
            with self.subTest(method=method):
                course = self.make_course(f'{method}-course')
                order = self.create_order(course=course).data
                response, provider = self.initiate(order['reference'], method=method)
                payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

                callback = self.hosted_callback(payment, method)

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertTrue(response.data['redirect_url'].startswith('https://checkout.example.test/'))
                provider.initiate_payment.assert_called_once()
                self.assertEqual(callback.status_code, status.HTTP_200_OK)
                self.assertTrue(Enrollment.objects.filter(student=self.user, course=course).exists())

    def test_wrong_currency_and_order_reference_do_not_confirm_payment(self):
        order = self.create_order().data
        response, _ = self.initiate(order['reference'], method='card')
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        wrong_currency = self.hosted_callback(payment, 'card', currency='USD')
        wrong_order = self.hosted_callback(
            payment,
            'card',
            order_reference='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        )

        payment.refresh_from_db()
        self.assertEqual(wrong_currency.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(wrong_order.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)

    def test_card_data_is_rejected_and_no_card_fields_are_persisted(self):
        order = self.create_order().data

        response = self.client.post(
            reverse('payments-order-initiate', kwargs={'order_reference': order['reference']}),
            {'method': 'card', 'card_number': '4111111111111111', 'cvv': '123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(PaymentTransaction.objects.count(), 0)
        self.assertFalse({'card_number', 'cvv'}.intersection(
            field.name for field in PaymentTransaction._meta.fields
        ))

    def test_hosted_checkout_stubs_cannot_create_fake_payment_sessions(self):
        order = self.create_order().data

        response = self.client.post(
            reverse('payments-order-initiate', kwargs={'order_reference': order['reference']}),
            {'method': 'card'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(Order.objects.get(reference=order['reference']).status, Order.Status.DRAFT)
        self.assertFalse(PaymentTransaction.objects.filter(order__reference=order['reference']).exists())

    def test_cart_checkout_api_prices_cart_and_starts_pending_payment(self):
        self.client.post(reverse('payments-cart'), {'course_id': self.course.pk}, format='json')
        provider = Mock()
        provider.initiate_payment.return_value = {
            'provider_reference': 'api-stk-reference',
            'redirect_url': '',
        }

        with patch('payments.services.get_provider', return_value=provider):
            response = self.client.post(reverse('payments-cart-checkout'), {
                'customer_name': 'Buyer Student',
                'customer_email': 'billing@example.test',
                'customer_phone': '0712345678',
            }, format='json')

        order = Order.objects.get(user=self.user)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], '120.00')
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.customer_email, 'billing@example.test')
        self.assertEqual(PaymentTransaction.objects.filter(order=order).count(), 1)
        self.assertFalse(Enrollment.objects.filter(student=self.user, course=self.course).exists())

    def test_course_catalog_exposes_pricing_capacity_duration_and_rating(self):
        self.course.seat_capacity = 2
        self.course.original_price = Decimal('150.00')
        self.course.save(update_fields=['seat_capacity', 'original_price'])
        Lesson.objects.create(course=self.course, title='First lesson', duration_minutes=45)
        Enrollment.objects.create(student=self.user, course=self.course)
        CourseReview.objects.create(course=self.course, student=self.user, rating=4)

        response = self.client.get('/api/v1/courses/')
        result = next(course for course in response.data['results'] if course['id'] == self.course.pk)

        self.assertEqual(result['enrolled_count'], 1)
        self.assertEqual(result['percent_booked'], 50.0)
        self.assertEqual(result['total_duration_hours'], 0.75)
        self.assertEqual(result['average_rating'], 4.0)
        self.assertEqual(result['original_price'], '150.00')
        self.assertTrue(result['is_available'])

    def test_multi_course_order_snapshots_prices_and_enrols_every_course(self):
        second_course = self.make_course('second-course', price='40.00')
        order = create_course_order_for_courses(
            user=self.user,
            courses=[self.course, second_course],
            customer_name='Buyer Student',
            customer_email='billing@example.test',
            customer_phone='0712345678',
        )
        response, _ = self.initiate(order.reference)
        payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

        callback = self.mpesa_callback(payment, amount='160.00')

        self.assertEqual(order.subtotal, Decimal('160.00'))
        self.assertEqual(callback.status_code, status.HTTP_200_OK)
        self.assertEqual(Enrollment.objects.filter(
            student=self.user, course__in=[self.course, second_course], order=order
        ).count(), 2)

    def test_active_order_reserves_capacity_and_expiration_releases_it(self):
        self.course.seat_capacity = 1
        self.course.save(update_fields=['seat_capacity'])
        order = create_course_order_for_courses(user=self.user, courses=[self.course])
        other = User.objects.create_user(username='other-buyer', password=PASSWORD)

        with self.assertRaises(DRFValidationError):
            create_course_order_for_courses(user=other, courses=[self.course])

        order.expires_at = timezone.now() - timedelta(minutes=1)
        order.status = Order.Status.PENDING
        order.save(update_fields=['expires_at', 'status'])
        payment = PaymentTransaction.objects.create(
            order=order,
            provider=PaymentTransaction.Provider.MPESA,
            amount=order.total,
            currency=order.currency,
            status=PaymentTransaction.Status.PENDING,
            provider_reference='expired-request',
        )
        expired = expire_order_if_stale(order)
        replacement = create_course_order_for_courses(user=other, courses=[self.course])

        payment.refresh_from_db()
        self.assertEqual(expired.status, Order.Status.EXPIRED)
        self.assertEqual(payment.status, PaymentTransaction.Status.EXPIRED)
        self.assertEqual(replacement.status, Order.Status.DRAFT)