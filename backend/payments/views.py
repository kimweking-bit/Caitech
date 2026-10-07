import logging

from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework import permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema

from .models import CartItem, Order, PaymentTransaction
from .cart import add_course_to_cart, get_user_cart, remove_course_from_cart
from .providers import ProviderError, callback_token, get_provider
from .serializers import (
	CallbackResponseSerializer,
	CartAddSerializer,
	CartCheckoutSerializer,
	CartCouponSerializer,
	CartResponseSerializer,
	HostedProviderCallbackSerializer,
	MpesaCallbackRequestSerializer,
	OrderCreateSerializer,
	OrderResponseSerializer,
	PaymentInitiateSerializer,
	PaymentInitiationResponseSerializer,
)
from .services import (
	CallbackError,
	apply_provider_callback,
	create_course_order,
	create_course_order_for_courses,
	expire_order_if_stale,
	initiate_payment,
	quote_course_order,
)

logger = logging.getLogger(__name__)


def _cart_payload(user, cart):
	courses = list(
		CartItem.objects.filter(cart=cart, course__is_published=True)
		.exclude(course__enrollments__student=user)
		.select_related('course')
		.order_by('created_at', 'pk')
	)
	cart_items = [item.course for item in courses]
	if not cart_items:
		return {
			'items': [], 'currency': '', 'subtotal': '0.00',
			'discount_amount': '0.00', 'fee_amount': '0.00', 'total': '0.00',
			'coupon_code': cart.coupon_code,
		}
	quote = quote_course_order(user=user, courses=cart_items, coupon_code=cart.coupon_code)
	return {
		'items': [{
			'course_id': course.pk,
			'title': course.title,
			'slug': course.slug,
			'image': course.image.url if course.image else None,
			'currency': course.currency,
			'unit_price': course.price,
			'original_price': course.original_price,
		} for course in cart_items],
		'currency': cart_items[0].currency,
		'subtotal': quote['subtotal'],
		'discount_amount': quote['discount_amount'],
		'fee_amount': quote['fee_amount'],
		'total': quote['total'],
		'coupon_code': cart.coupon_code,
	}


class CartV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(responses={200: CartResponseSerializer})
	def get(self, request):
		return Response(_cart_payload(request.user, get_user_cart(request.user)))

	@extend_schema(request=CartAddSerializer, responses={200: CartResponseSerializer})
	def post(self, request):
		serializer = CartAddSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		add_course_to_cart(user=request.user, course_id=serializer.validated_data['course_id'])
		return Response(_cart_payload(request.user, get_user_cart(request.user)))


class CartItemDetailV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(responses={200: CartResponseSerializer})
	def delete(self, request, course_id):
		cart = get_user_cart(request.user)
		remove_course_from_cart(cart=cart, course_id=course_id)
		return Response(_cart_payload(request.user, cart))


class CartCouponV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(request=CartCouponSerializer, responses={200: CartResponseSerializer})
	def post(self, request):
		serializer = CartCouponSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		cart = get_user_cart(request.user)
		payload = _cart_payload(request.user, cart)
		courses = [
			item.course for item in CartItem.objects.filter(cart=cart).select_related('course')
		]
		quote = quote_course_order(
			user=request.user,
			courses=courses,
			coupon_code=serializer.validated_data['coupon_code'],
		)
		cart.coupon_code = quote['coupon'].code
		cart.save(update_fields=['coupon_code', 'updated_at'])
		return Response(_cart_payload(request.user, cart))


class CartCheckoutV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(
		request=CartCheckoutSerializer,
		responses={201: OrderResponseSerializer},
		description='Create a server-priced order for the authenticated cart and start M-Pesa when payment is due.',
	)
	def post(self, request):
		cart = get_user_cart(request.user)
		items = list(
			CartItem.objects.filter(cart=cart).select_related('course').order_by('course_id')
		)
		serializer = CartCheckoutSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		order = create_course_order_for_courses(
			user=request.user,
			courses=[item.course for item in items],
			coupon_code=cart.coupon_code,
			**serializer.validated_data,
		)
		if order.status != Order.Status.PAID:
			callback_url = lambda payment: request.build_absolute_uri(reverse(
				'payments-mpesa-callback',
				kwargs={
					'transaction_reference': payment.reference,
					'token': callback_token(payment),
				},
			))
			try:
				initiate_payment(
					order=order,
					method=PaymentTransaction.Provider.MPESA,
					phone_number=serializer.validated_data['customer_phone'],
					callback_url=callback_url,
					return_url=request.build_absolute_uri(reverse(
						'storefront-payment-return', kwargs={'order_reference': order.reference}
					)),
				)
			except ProviderError as exc:
				logger.warning('Payment initiation failed for order %s: %s', order.reference, exc)
				return Response(
					{'detail': 'We could not start your payment. Please check your details and try again.'},
					status=status.HTTP_502_BAD_GATEWAY,
				)
		cart.items.all().delete()
		cart.coupon_code = ''
		cart.save(update_fields=['coupon_code', 'updated_at'])
		order.refresh_from_db()
		return Response(OrderResponseSerializer(order).data, status=status.HTTP_201_CREATED)

	@extend_schema(responses={200: CartResponseSerializer})
	def delete(self, request):
		cart = get_user_cart(request.user)
		cart.coupon_code = ''
		cart.save(update_fields=['coupon_code', 'updated_at'])
		return Response(_cart_payload(request.user, cart))


class OrderCreateV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(
		request=OrderCreateSerializer,
		responses={201: OrderResponseSerializer},
		description='Create an order for one course. Coupon discounts are calculated by the server.',
	)
	def post(self, request):
		serializer = OrderCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		order = create_course_order(
			user=request.user,
			course_id=serializer.validated_data['course_id'],
			coupon_code=serializer.validated_data.get('coupon_code', ''),
			customer_name=serializer.validated_data.get('customer_name', ''),
			customer_email=serializer.validated_data.get('customer_email', ''),
			customer_phone=serializer.validated_data.get('customer_phone', ''),
		)
		return Response(OrderResponseSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderStatusV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(responses={200: OrderResponseSerializer})
	def get(self, request, order_reference):
		order = get_object_or_404(
			Order.objects.prefetch_related('items', 'transactions'),
			reference=order_reference,
			user=request.user,
		)
		order = expire_order_if_stale(order)
		return Response(OrderResponseSerializer(order).data)


class PaymentInitiateV1(APIView):
	permission_classes = [permissions.IsAuthenticated]

	@extend_schema(
		request=PaymentInitiateSerializer,
		responses={
			200: PaymentInitiationResponseSerializer,
			502: OpenApiResponse(description='The payment provider could not initiate the payment.'),
		},
	)
	def post(self, request, order_reference):
		order = get_object_or_404(
			Order.objects.select_related('user'),
			reference=order_reference,
			user=request.user,
		)
		serializer = PaymentInitiateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		method = serializer.validated_data['method']
		callback_url = request.build_absolute_uri(reverse(
			'payments-hosted-callback', kwargs={'provider': method}
		))
		if method == PaymentTransaction.Provider.MPESA:
			callback_url = lambda payment: request.build_absolute_uri(reverse(
				'payments-mpesa-callback',
				kwargs={
					'transaction_reference': payment.reference,
					'token': callback_token(payment),
				},
			))
		return_url = request.build_absolute_uri(reverse(
			'storefront-payment-return', kwargs={'order_reference': order.reference}
		))
		try:
			payment = initiate_payment(
				order=order,
				method=method,
				phone_number=serializer.validated_data.get('phone_number', ''),
				callback_url=callback_url,
				return_url=return_url,
			)
		except ProviderError as exc:
				logger.warning('Cart payment initiation failed for order %s: %s', order.reference, exc)
				return Response(
					{'detail': 'We could not start your payment. Please try again shortly.'},
					status=status.HTTP_502_BAD_GATEWAY,
				)
		order.refresh_from_db()
		return Response({
			'order_reference': order.reference,
			'order_status': order.status,
			'transaction_reference': payment.reference,
			'provider': payment.provider,
			'payment_status': payment.status,
			'redirect_url': payment.redirect_url,
		})


class MpesaCallbackV1(APIView):
	permission_classes = [permissions.AllowAny]

	@extend_schema(
		request=MpesaCallbackRequestSerializer,
		responses={
			200: CallbackResponseSerializer,
			400: OpenApiResponse(description='Invalid callback payload or transaction details.'),
			403: OpenApiResponse(description='Callback authentication failed.'),
		},
		description='Daraja STK callback. The transaction-bound URL token authenticates the callback.',
	)
	def post(self, request, transaction_reference, token):
		try:
			payment = PaymentTransaction.objects.select_related('order').get(
				reference=transaction_reference,
				provider=PaymentTransaction.Provider.MPESA,
			)
		except PaymentTransaction.DoesNotExist as exc:
			raise NotFound('Payment transaction not found.') from exc

		provider = get_provider(PaymentTransaction.Provider.MPESA)
		if not provider.verify_callback(
			body=request.body,
			headers=request.headers,
			transaction=payment,
			token=token,
		):
			return Response({'detail': 'Invalid callback authentication.'}, status=status.HTTP_403_FORBIDDEN)

		payload = MpesaCallbackRequestSerializer(data=request.data)
		payload.is_valid(raise_exception=True)
		callback = payload.validated_data['Body'].get('stkCallback', {})
		if not isinstance(callback, dict):
			return Response({'detail': 'Invalid M-Pesa callback structure.'}, status=status.HTTP_400_BAD_REQUEST)
		provider_reference = callback.get('CheckoutRequestID')
		result_code = callback.get('ResultCode')
		if provider_reference is None or result_code is None:
			return Response({'detail': 'Incomplete M-Pesa callback.'}, status=status.HTTP_400_BAD_REQUEST)
		metadata_container = callback.get('CallbackMetadata') or {}
		if not isinstance(metadata_container, dict):
			return Response({'detail': 'Invalid M-Pesa callback metadata.'}, status=status.HTTP_400_BAD_REQUEST)
		metadata = metadata_container.get('Item', [])
		if not isinstance(metadata, list) or any(not isinstance(item, dict) for item in metadata):
			return Response({'detail': 'Invalid M-Pesa callback metadata.'}, status=status.HTTP_400_BAD_REQUEST)
		metadata_values = {item.get('Name'): item.get('Value') for item in metadata if 'Name' in item}
		payment_status = (
			PaymentTransaction.Status.CONFIRMED
			if str(result_code) == '0'
			else PaymentTransaction.Status.FAILED
		)
		try:
			duplicate = apply_provider_callback(
				transaction_reference=payment.reference,
				provider=PaymentTransaction.Provider.MPESA,
				order_reference=payment.order.reference,
				provider_reference=provider_reference,
				payment_status=payment_status,
				amount=metadata_values.get('Amount'),
				provider_payment_reference=str(metadata_values.get('MpesaReceiptNumber', '')),
			)
		except CallbackError as exc:
			return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'received': True, 'duplicate': duplicate})


class HostedProviderCallbackV1(APIView):
	permission_classes = [permissions.AllowAny]

	@extend_schema(
		request=HostedProviderCallbackSerializer,
		parameters=[OpenApiParameter(
			name='X-Provider-Signature',
			type=OpenApiTypes.STR,
			location=OpenApiParameter.HEADER,
			required=True,
			description='Hex-encoded HMAC-SHA256 of the raw request body.',
		)],
		responses={
			200: CallbackResponseSerializer,
			400: OpenApiResponse(description='Invalid callback payload or transaction details.'),
			403: OpenApiResponse(description='Callback signature verification failed.'),
		},
	)
	def post(self, request, provider):
		if provider not in (PaymentTransaction.Provider.CARD, PaymentTransaction.Provider.PAYPAL):
			raise NotFound('Provider callback not found.')
		payload = HostedProviderCallbackSerializer(data=request.data)
		payload.is_valid(raise_exception=True)
		data = payload.validated_data
		try:
			payment = PaymentTransaction.objects.select_related('order').get(
				reference=data['transaction_reference'],
				provider=provider,
			)
		except PaymentTransaction.DoesNotExist as exc:
			raise NotFound('Payment transaction not found.') from exc
		provider_adapter = get_provider(provider, for_callback=True)
		if not provider_adapter.verify_callback(
			body=request.body,
			headers=request.headers,
			transaction=payment,
		):
			return Response({'detail': 'Invalid callback signature.'}, status=status.HTTP_403_FORBIDDEN)
		try:
			duplicate = apply_provider_callback(
				transaction_reference=payment.reference,
				provider=provider,
				order_reference=data['order_reference'],
				provider_reference=data['provider_reference'],
				payment_status=data['status'],
				amount=data.get('amount'),
				currency=data.get('currency'),
				provider_payment_reference=data.get('provider_payment_reference', ''),
			)
		except CallbackError as exc:
			return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'received': True, 'duplicate': duplicate})
