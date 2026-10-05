import hmac
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from accounts.services import send_notification_email
from courses.models import Course, Enrollment

from .models import Coupon, CouponRedemption, Order, OrderItem, PaymentTransaction
from .providers import ProviderError, get_provider

CENT = Decimal('0.01')


class CallbackError(Exception):
    pass


def _send_enrollment_email(user, course):
    send_notification_email(
        'enrolment',
        user.email,
        'Enrollment confirmed',
        (
            f'Hello {user.username},\n\n'
            f'You have been enrolled in {course.title}.\n'
            'Your course access has been activated and you can continue learning.'
        ),
        related_user=user,
    )


def _discount_for_coupon(coupon, subtotal):
    if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
        discount = subtotal * coupon.amount / Decimal('100')
    else:
        discount = coupon.amount
    return min(subtotal, discount).quantize(CENT, rounding=ROUND_HALF_UP)


def _validate_coupon(code, user, course, subtotal):
    coupon = Coupon.objects.select_for_update().filter(code__iexact=code.strip()).first()
    if not coupon or not coupon.is_active:
        raise ValidationError({'coupon_code': 'This coupon is invalid or inactive.'})
    now = timezone.now()
    if coupon.starts_at and coupon.starts_at > now:
        raise ValidationError({'coupon_code': 'This coupon is not active yet.'})
    if coupon.expires_at and coupon.expires_at <= now:
        raise ValidationError({'coupon_code': 'This coupon has expired.'})
    if coupon.course_id and coupon.course_id != course.pk:
        raise ValidationError({'coupon_code': 'This coupon does not apply to this course.'})
    if coupon.discount_type == Coupon.DiscountType.FIXED and coupon.currency != course.currency:
        raise ValidationError({'coupon_code': 'This coupon uses a different currency.'})
    if subtotal < coupon.minimum_order_amount:
        raise ValidationError({'coupon_code': 'The order does not meet this coupon minimum.'})
    redemptions = CouponRedemption.objects.filter(coupon=coupon)
    if coupon.max_redemptions is not None and redemptions.count() >= coupon.max_redemptions:
        raise ValidationError({'coupon_code': 'This coupon has reached its redemption limit.'})
    if redemptions.filter(user=user).count() >= coupon.per_user_limit:
        raise ValidationError({'coupon_code': 'You have reached this coupon redemption limit.'})
    return coupon


def _record_redemption(order):
    if order.coupon_id:
        CouponRedemption.objects.get_or_create(
            order=order,
            defaults={
                'coupon': order.coupon,
                'user': order.user,
                'discount_amount': order.discount_amount,
            },
        )


def create_course_order(*, user, course_id, coupon_code=''):
    email_course = None
    with transaction.atomic():
        try:
            course = Course.objects.select_for_update().get(pk=course_id)
        except Course.DoesNotExist as exc:
            raise ValidationError({'course_id': 'Course not found.'}) from exc
        if Enrollment.objects.filter(student=user, course=course).exists():
            raise ValidationError({'course_id': 'You are already enrolled in this course.'})

        subtotal = Decimal('0.00') if course.is_free else course.price
        coupon = _validate_coupon(coupon_code, user, course, subtotal) if coupon_code else None
        discount = _discount_for_coupon(coupon, subtotal) if coupon else Decimal('0.00')
        total = max(Decimal('0.00'), subtotal - discount).quantize(CENT)
        order = Order.objects.create(
            user=user,
            status=Order.Status.DRAFT,
            currency=course.currency,
            subtotal=subtotal,
            discount_amount=discount,
            total=total,
            coupon=coupon,
            coupon_code=coupon.code if coupon else '',
        )
        OrderItem.objects.create(
            order=order,
            course=course,
            course_title=course.title,
            unit_price=subtotal,
            currency=course.currency,
        )

        if total == 0:
            order.status = Order.Status.PAID
            order.save(update_fields=['status', 'updated_at'])
            _, created = Enrollment.objects.get_or_create(student=user, course=course)
            _record_redemption(order)
            if created:
                email_course = course

    if email_course:
        _send_enrollment_email(user, email_course)
    return order


def initiate_payment(*, order, method, phone_number='', callback_url='', return_url=''):
    with transaction.atomic():
        locked_order = Order.objects.select_for_update().select_related('user').get(pk=order.pk)
        if locked_order.status == Order.Status.PAID or locked_order.total <= 0:
            raise ValidationError({'detail': 'This order does not require payment.'})
        if locked_order.status not in (Order.Status.DRAFT, Order.Status.FAILED):
            raise ValidationError({'detail': 'This order cannot accept another payment attempt.'})
        if locked_order.transactions.filter(
            status__in=[PaymentTransaction.Status.INITIATED, PaymentTransaction.Status.PENDING]
        ).exists():
            raise ValidationError({'detail': 'A payment attempt is already in progress.'})

        provider = get_provider(method)
        payment = PaymentTransaction.objects.create(
            order=locked_order,
            provider=method,
            amount=locked_order.total,
            currency=locked_order.currency,
            phone_number=phone_number if method == PaymentTransaction.Provider.MPESA else '',
        )
        locked_order.status = Order.Status.PENDING
        locked_order.save(update_fields=['status', 'updated_at'])

    try:
        result = provider.initiate_payment(
            payment,
            callback_url=callback_url(payment) if callable(callback_url) else callback_url,
            return_url=return_url,
        )
        if not isinstance(result, dict) or not result.get('provider_reference'):
            raise ProviderError('The payment provider did not return a transaction reference.')
    except ProviderError:
        PaymentTransaction.objects.filter(pk=payment.pk).update(
            status=PaymentTransaction.Status.FAILED,
            completed_at=timezone.now(),
        )
        Order.objects.filter(pk=order.pk, status=Order.Status.PENDING).update(
            status=Order.Status.FAILED,
        )
        raise

    PaymentTransaction.objects.filter(pk=payment.pk).update(
        provider_reference=str(result['provider_reference']),
        redirect_url=result.get('redirect_url') or '',
        status=PaymentTransaction.Status.PENDING,
    )
    payment.refresh_from_db()
    return payment


def _hmac_compare(left, right):
    return bool(left) and hmac.compare_digest(left, right)


def apply_provider_callback(
    *, transaction_reference, provider, order_reference, provider_reference,
    payment_status, amount=None, provider_payment_reference='',
):
    email_details = None
    try:
        normalized_amount = Decimal(str(amount)) if amount is not None else None
    except (InvalidOperation, ValueError) as exc:
        raise CallbackError('Callback amount is invalid.') from exc

    with transaction.atomic():
        try:
            payment = PaymentTransaction.objects.select_for_update().select_related(
                'order', 'order__user'
            ).get(reference=transaction_reference)
        except PaymentTransaction.DoesNotExist as exc:
            raise CallbackError('Payment transaction not found.') from exc
        order = payment.order
        if payment.provider != provider:
            raise CallbackError('Payment provider does not match the transaction.')
        if str(order.reference) != str(order_reference):
            raise CallbackError('Order reference does not match the transaction.')
        if not provider_reference or not _hmac_compare(
            payment.provider_reference, str(provider_reference)
        ):
            raise CallbackError('Provider reference does not match the transaction.')
        if payment_status not in {
            PaymentTransaction.Status.CONFIRMED,
            PaymentTransaction.Status.FAILED,
            PaymentTransaction.Status.CANCELLED,
            PaymentTransaction.Status.EXPIRED,
        }:
            raise CallbackError('Payment status is not supported.')
        if payment_status == PaymentTransaction.Status.CONFIRMED:
            if (
                normalized_amount is None
                or not normalized_amount.is_finite()
                or normalized_amount != payment.amount
            ):
                raise CallbackError('Callback amount does not match the order.')

        if payment.status == PaymentTransaction.Status.CONFIRMED:
            return True
        if payment.status in {
            PaymentTransaction.Status.FAILED,
            PaymentTransaction.Status.CANCELLED,
            PaymentTransaction.Status.EXPIRED,
        } and payment.status == payment_status:
            return True

        if payment_status == PaymentTransaction.Status.CONFIRMED:
            if order.status == Order.Status.PAID:
                raise CallbackError('This order was already paid by another transaction.')
            payment.status = PaymentTransaction.Status.CONFIRMED
            payment.provider_payment_reference = provider_payment_reference[:150]
            payment.completed_at = timezone.now()
            payment.save(update_fields=[
                'status', 'provider_payment_reference', 'completed_at', 'updated_at',
            ])
            order.status = Order.Status.PAID
            order.save(update_fields=['status', 'updated_at'])
            item = order.items.select_related('course').get()
            _, created = Enrollment.objects.get_or_create(student=order.user, course=item.course)
            _record_redemption(order)
            if created:
                email_details = (order.user, item.course)
        else:
            payment.status = payment_status
            payment.completed_at = timezone.now()
            payment.save(update_fields=['status', 'completed_at', 'updated_at'])
            order.status = {
                PaymentTransaction.Status.FAILED: Order.Status.FAILED,
                PaymentTransaction.Status.CANCELLED: Order.Status.CANCELLED,
                PaymentTransaction.Status.EXPIRED: Order.Status.EXPIRED,
            }[payment_status]
            order.save(update_fields=['status', 'updated_at'])

    if email_details:
        _send_enrollment_email(*email_details)
    return False