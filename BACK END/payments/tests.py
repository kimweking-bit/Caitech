import hashlib
import hmac
import json
from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from courses.models import Category, Course, CourseReview, Enrollment, Lesson

from .models import Coupon, Order, PaymentTransaction
from .providers import callback_token

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
			username='buyer',
			email='buyer@example.test',
			password=PASSWORD,
		)
		self.client.force_authenticate(self.user)
		self.category = Category.objects.create(name='Technology', slug='technology')
		self.course = self.make_course('paid-course', price='120.00')

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
		response = self.client.post(reverse('payments-order-create'), payload, format='json')
		return response

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
		callback_url = reverse('payments-mpesa-callback', kwargs={
			'transaction_reference': payment.reference,
			'token': token or callback_token(payment),
		})
		return self.client.post(
			callback_url,
			{'Body': {'stkCallback': callback}},
			format='json',
		)

	def test_successful_mpesa_callback_enrols_once_and_sends_email(self):
		order_response = self.create_order()
		self.assertEqual(order_response.status_code, status.HTTP_201_CREATED)
		order_reference = order_response.data['reference']
		response, provider = self.initiate(order_reference)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		provider.initiate_payment.assert_called_once()
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

		callback_response = self.mpesa_callback(payment)

		self.assertEqual(callback_response.status_code, status.HTTP_200_OK)
		self.assertFalse(callback_response.data['duplicate'])
		payment.refresh_from_db()
		order = Order.objects.get(reference=order_reference)
		self.assertEqual(payment.status, PaymentTransaction.Status.CONFIRMED)
		self.assertEqual(order.status, Order.Status.PAID)
		self.assertTrue(Enrollment.objects.filter(student=self.user, course=self.course).exists())
		self.assertEqual(len(__import__('django.core.mail').core.mail.outbox), 1)

	def test_failed_mpesa_callback_does_not_enrol(self):
		order = self.create_order().data
		response, _ = self.initiate(order['reference'])
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

		callback_response = self.mpesa_callback(payment, result_code=1032)

		self.assertEqual(callback_response.status_code, status.HTTP_200_OK)
		payment.refresh_from_db()
		self.assertEqual(payment.status, PaymentTransaction.Status.FAILED)
		self.assertEqual(Order.objects.get(pk=payment.order_id).status, Order.Status.FAILED)
		self.assertFalse(Enrollment.objects.filter(student=self.user, course=self.course).exists())

	def test_duplicate_mpesa_callback_is_idempotent(self):
		order = self.create_order().data
		response, _ = self.initiate(order['reference'])
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

		first = self.mpesa_callback(payment)
		second = self.mpesa_callback(payment)

		self.assertEqual(first.status_code, status.HTTP_200_OK)
		self.assertEqual(second.status_code, status.HTTP_200_OK)
		self.assertTrue(second.data['duplicate'])
		self.assertEqual(Enrollment.objects.filter(student=self.user, course=self.course).count(), 1)

	def test_wrong_mpesa_amount_is_rejected_without_confirmation(self):
		order = self.create_order().data
		response, _ = self.initiate(order['reference'])
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

		callback_response = self.mpesa_callback(payment, amount='119.00')

		self.assertEqual(callback_response.status_code, status.HTTP_400_BAD_REQUEST)
		payment.refresh_from_db()
		self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)
		self.assertFalse(Enrollment.objects.filter(student=self.user, course=self.course).exists())

	def test_invalid_mpesa_callback_token_is_rejected(self):
		order = self.create_order().data
		response, _ = self.initiate(order['reference'])
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])

		callback_response = self.mpesa_callback(payment, token='invalid-token')

		self.assertEqual(callback_response.status_code, status.HTTP_403_FORBIDDEN)
		payment.refresh_from_db()
		self.assertEqual(payment.status, PaymentTransaction.Status.PENDING)

	def test_callback_order_reference_must_match(self):
		order = self.create_order().data
		response, _ = self.initiate(order['reference'], method='card')
		payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])
		payload = {
			'transaction_reference': str(payment.reference),
			'order_reference': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
			'provider_reference': payment.provider_reference,
			'amount': '120.00',
			'status': PaymentTransaction.Status.CONFIRMED,
		}
		raw_body = json.dumps(payload, separators=(',', ':')).encode()
		signature = hmac.new(b'test-card-webhook-secret', raw_body, hashlib.sha256).hexdigest()

		callback_response = self.client.generic(
			'POST',
			reverse('payments-hosted-callback', kwargs={'provider': 'card'}),
			raw_body,
			content_type='application/json',
			HTTP_X_PROVIDER_SIGNATURE=signature,
		)

		self.assertEqual(callback_response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_invalid_coupon_is_rejected(self):
		response = self.create_order(coupon_code='NOT-A-COUPON')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(Order.objects.count(), 0)

	def test_coupon_discount_is_calculated_and_snapshotted(self):
		coupon = Coupon.objects.create(
			code='SAVE25',
			discount_type=Coupon.DiscountType.PERCENTAGE,
			amount='25.00',
			currency='KES',
		)

		response = self.create_order(coupon_code=coupon.code.lower())

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['subtotal'], '120.00')
		self.assertEqual(response.data['discount_amount'], '30.00')
		self.assertEqual(response.data['total'], '90.00')
		order = Order.objects.get(reference=response.data['reference'])
		self.assertEqual(order.items.get().unit_price, Decimal('120.00'))
		self.assertEqual(order.coupon_code, 'SAVE25')

	def test_free_course_creates_paid_order_and_enrollment_without_payment(self):
		free_course = self.make_course('free-course', price='0.00', is_free=True)

		response = self.create_order(course=free_course)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], Order.Status.PAID)
		self.assertEqual(response.data['total'], '0.00')
		self.assertEqual(PaymentTransaction.objects.count(), 0)
		self.assertTrue(Enrollment.objects.filter(student=self.user, course=free_course).exists())

	def test_card_and_paypal_hosted_flows_use_mocked_providers(self):
		for method in ('card', 'paypal'):
			with self.subTest(method=method):
				course = self.make_course(f'{method}-course')
				order = self.create_order(course=course).data
				response, provider = self.initiate(order['reference'], method=method)
				self.assertEqual(response.status_code, status.HTTP_200_OK)
				self.assertEqual(response.data['redirect_url'], f'https://checkout.example.test/{method}/session')
				provider.initiate_payment.assert_called_once()

				payment = PaymentTransaction.objects.get(reference=response.data['transaction_reference'])
				callback = {
					'transaction_reference': str(payment.reference),
					'order_reference': str(payment.order.reference),
					'provider_reference': payment.provider_reference,
					'amount': '120.00',
					'status': PaymentTransaction.Status.CONFIRMED,
				}
				raw_body = json.dumps(callback, separators=(',', ':')).encode()
				secret = f'test-{method}-webhook-secret'.encode()
				signature = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
				callback_response = self.client.generic(
					'POST',
					reverse('payments-hosted-callback', kwargs={'provider': method}),
					raw_body,
					content_type='application/json',
					HTTP_X_PROVIDER_SIGNATURE=signature,
				)

				self.assertEqual(callback_response.status_code, status.HTTP_200_OK)
				self.assertTrue(Enrollment.objects.filter(student=self.user, course=course).exists())

	def test_card_number_and_cvv_are_rejected_and_never_persisted(self):
		order = self.create_order().data

		response = self.client.post(
			reverse('payments-order-initiate', kwargs={'order_reference': order['reference']}),
			{
				'method': 'card',
				'card_number': '4111111111111111',
				'cvv': '123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(PaymentTransaction.objects.count(), 0)
		self.assertFalse({'card_number', 'cvv'}.intersection(field.name for field in PaymentTransaction._meta.fields))

	def test_course_catalog_exposes_computed_shop_fields(self):
		self.course.seat_capacity = 2
		self.course.original_price = '150.00'
		self.course.save(update_fields=['seat_capacity', 'original_price'])
		Lesson.objects.create(course=self.course, title='First lesson', duration_minutes=45)
		Enrollment.objects.create(student=self.user, course=self.course)
		CourseReview.objects.create(course=self.course, student=self.user, rating=4)

		response = self.client.get('/api/v1/courses/')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		result = next(course for course in response.data['results'] if course['id'] == self.course.pk)
		self.assertEqual(result['enrolled_count'], 1)
		self.assertEqual(result['percent_booked'], 50.0)
		self.assertEqual(result['total_duration_hours'], 0.75)
		self.assertEqual(result['currency'], 'KES')
		self.assertEqual(result['original_price'], '150.00')
		self.assertEqual(result['average_rating'], 4.0)

	def test_course_create_response_includes_computed_fields(self):
		instructor = User.objects.create_user(
			username='new-course-instructor',
			password=PASSWORD,
			is_student=False,
			is_instructor=True,
			is_verified_instructor=True,
		)
		self.client.force_authenticate(instructor)

		response = self.client.post('/api/v1/courses/', {
			'title': 'New catalog course',
			'slug': 'new-catalog-course',
			'description': 'A new course.',
			'category': self.category.pk,
			'price': '75.00',
			'original_price': '100.00',
			'currency': 'USD',
			'seat_capacity': 5,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['currency'], 'USD')
		self.assertEqual(response.data['enrolled_count'], 0)
		self.assertEqual(response.data['percent_booked'], 0.0)
		self.assertEqual(response.data['total_duration_hours'], 0)
		self.assertIsNone(response.data['average_rating'])
