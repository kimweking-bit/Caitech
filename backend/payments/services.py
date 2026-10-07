import hmac
from datetime import timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.conf import settings
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


def _discount_for_coupon(coupon, subtotal):
    if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
        discount = subtotal * coupon.amount / Decimal('100')
    else:
        discount = coupon.amount
    return min(subtotal, discount).quantize(CENT, rounding=ROUND_HALF_UP)


def _validate_coupon(code, user, courses, subtotal):
    coupon = Coupon.objects.select_for_update().filter(code__iexact=code.strip()).first()
    if not coupon or not coupon.is_active:
        raise ValidationError({'coupon_code': 'This coupon is invalid or inactive.'})
    now = timezone.now()
    if coupon.starts_at and coupon.starts_at > now:
        raise ValidationError({'coupon_code': 'This coupon is not active yet.'})
    if coupon.expires_at and coupon.expires_at <= now:
        raise ValidationError({'coupon_code': 'This coupon has expired.'})
    course_ids = {course.pk for course in courses}
    if coupon.course_id and coupon.course_id not in course_ids:
        raise ValidationError({'coupon_code': 'This coupon does not apply to this course.'})
    if coupon.discount_type == Coupon.DiscountType.FIXED and any(
        coupon.currency != course.currency for course in courses
    ):
        raise ValidationError({'coupon_code': 'This coupon uses a different currency.'})
    if subtotal < coupon.minimum_order_amount:
        raise ValidationError({'coupon_code': 'The order does not meet this coupon minimum.'})
    redemptions = CouponRedemption.objects.filter(coupon=coupon)
    reservations = Order.objects.filter(
        coupon=coupon,
        status__in=[Order.Status.DRAFT, Order.Status.PENDING],
        expires_at__gt=now,
    )
    if coupon.max_redemptions is not None and (
        redemptions.count() + reservations.count() >= coupon.max_redemptions
    ):
        raise ValidationError({'coupon_code': 'This coupon has reached its redemption limit.'})
    if (
        redemptions.filter(user=user).count()
        + reservations.filter(user=user).count()
        >= coupon.per_user_limit
    ):
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


def _validate_courses_for_order(*, user, courses):
    now = timezone.now()
    if not courses:
        raise ValidationError({'courses': 'Add at least one course to your cart.'})
    if len({course.pk for course in courses}) != len(courses):
        raise ValidationError({'courses': 'A course can only appear once in an order.'})
    if len({course.currency for course in courses}) != 1:
        raise ValidationError({'courses': 'Courses in one order must use the same currency.'})

    for course in courses:
        if not course.is_published or course.intake_status == Course.IntakeStatus.CLOSED:
            raise ValidationError({'courses': f'{course.title} is not currently available.'})
        if Enrollment.objects.filter(student=user, course=course).exists():
            raise ValidationError({'courses': f'You are already enrolled in {course.title}.'})
        pending_items = OrderItem.objects.filter(
            course=course,
            order__user=user,
            order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
            order__expires_at__gt=now,
        )
        if pending_items.exists():
            raise ValidationError({'courses': f'{course.title} is already in an active order.'})
        if course.seat_capacity is not None:
            reserved = OrderItem.objects.filter(
                course=course,
                order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
                order__expires_at__gt=now,
            ).count()
            if course.enrollments.count() + reserved >= course.seat_capacity:
                raise ValidationError({'courses': f'{course.title} has no seats available.'})


def _course_order_quote(*, user, courses, coupon_code=''):
    subtotal = sum((course.price for course in courses), Decimal('0.00'))
    coupon = _validate_coupon(coupon_code, user, courses, subtotal) if coupon_code else None
    discountable_subtotal = subtotal
    if coupon and coupon.course_id:
        discountable_subtotal = sum(
            (course.price for course in courses if course.pk == coupon.course_id),
            Decimal('0.00'),
        )
    discount = (
        _discount_for_coupon(coupon, discountable_subtotal)
        if coupon
        else Decimal('0.00')
    )
    total = max(Decimal('0.00'), subtotal - discount).quantize(CENT)
    return {
        'subtotal': subtotal.quantize(CENT),
        'discount_amount': discount,
        'fee_amount': Decimal('0.00'),
        'total': total,
        'coupon': coupon,
    }


def quote_course_order(*, user, courses, coupon_code=''):
    courses = list(courses)
    if not courses:
        raise ValidationError({'courses': 'Add at least one course to your cart.'})
    if any(
        not course.is_published or course.intake_status == Course.IntakeStatus.CLOSED
        for course in courses
    ):
        raise ValidationError({'courses': 'One or more courses are not currently available.'})
    if len({course.currency for course in courses}) != 1:
        raise ValidationError({'courses': 'Courses in one order must use the same currency.'})
    return _course_order_quote(user=user, courses=courses, coupon_code=coupon_code)


def create_course_order_for_courses(
    *, user, courses, coupon_code='', customer_name='', customer_email='', customer_phone='',
):
    email_courses = []
    course_ids = sorted({course.pk for course in courses})
    with transaction.atomic():
        locked_courses = list(
            Course.objects.select_for_update()
            .filter(pk__in=course_ids)
            .order_by('pk')
        )
        if len(locked_courses) != len(course_ids):
            raise ValidationError({'courses': 'One or more courses are no longer available.'})
        _validate_courses_for_order(user=user, courses=locked_courses)
        quote = _course_order_quote(
            user=user,
            courses=locked_courses,
            coupon_code=coupon_code,
        )
        expires_at = timezone.now() + timedelta(minutes=30)
        order = Order.objects.create(
            user=user,
            status=Order.Status.DRAFT,
            currency=locked_courses[0].currency,
            customer_name=customer_name.strip() or user.get_full_name() or user.username,
            customer_email=customer_email.strip() or user.email,
            customer_phone=customer_phone.strip(),
            subtotal=quote['subtotal'],
            discount_amount=quote['discount_amount'],
            fee_amount=quote['fee_amount'],
            total=quote['total'],
            coupon=quote['coupon'],
            coupon_code=quote['coupon'].code if quote['coupon'] else '',
            expires_at=expires_at,
        )
        coupon = quote['coupon']
        for course in locked_courses:
            OrderItem.objects.create(
                order=order,
                course=course,
                course_title=course.title,
                unit_price=course.price,
                original_unit_price=course.original_price,
                currency=course.currency,
            )

        if order.total == 0:
            order.status = Order.Status.PAID
            order.save(update_fields=['status', 'updated_at'])
            for course in locked_courses:
                _, created = Enrollment.objects.get_or_create(
                    student=user,
                    course=course,
                    defaults={'order': order},
                )
                if created:
                    email_courses.append(course)
            _record_redemption(order)

    if email_courses:
        _send_order_confirmation_email(order, email_courses)
    return order


def create_course_order(
    *, user, course_id, coupon_code='', customer_name='', customer_email='', customer_phone='',
):
    with transaction.atomic():
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist as exc:
            raise ValidationError({'course_id': 'Course not found.'}) from exc
    return create_course_order_for_courses(
        user=user,
        courses=[course],
        coupon_code=coupon_code,
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
    )


def expire_order_if_stale(order):
    with transaction.atomic():
        locked_order = Order.objects.select_for_update().get(pk=order.pk)
        if (
            locked_order.status not in (Order.Status.DRAFT, Order.Status.PENDING)
            or not locked_order.expires_at
            or locked_order.expires_at > timezone.now()
        ):
            return locked_order
        now = timezone.now()
        PaymentTransaction.objects.filter(
            order=locked_order,
            status__in=[PaymentTransaction.Status.INITIATED, PaymentTransaction.Status.PENDING],
        ).update(status=PaymentTransaction.Status.EXPIRED, completed_at=now, updated_at=now)
        locked_order.status = Order.Status.EXPIRED
        locked_order.save(update_fields=['status', 'updated_at'])
        return locked_order


def _send_order_confirmation_email(order, courses):
    if order.confirmation_email_sent:
        return True
    course_names = ', '.join(course.title for course in courses)
    student_name = order.customer_name or order.user.get_full_name() or order.user.username
    dashboard_url = f'{settings.SITE_URL.rstrip("/")}/dashboard/'
    sent = send_notification_email(
        'enrolment',
        order.customer_email or order.user.email,
        'Your CAI Technologies course enrollment is confirmed',
        (
            f'Hello {student_name},\n\n'
            f'Your purchase of {course_names} is confirmed.\n'
            f'Order: CAI-{str(order.reference).split("-")[0].upper()}\n'
            f'Amount paid: {order.currency} {order.total}\n'
            'Payment status: PAID\n'
            'Your course access is now active.\n\n'
            f'Go to My Courses: {dashboard_url}\n\n'
            'CAI Technologies'
        ),
        related_user=order.user,
    )
    order.confirmation_email_last_attempt = timezone.now()
    if sent:
        order.confirmation_email_sent = True
    order.save(update_fields=[
        'confirmation_email_sent',
        'confirmation_email_last_attempt',
        'updated_at',
    ])
    return sent


def initiate_payment(*, order, method, phone_number='', callback_url='', return_url=''):
    order = expire_order_if_stale(order)
    with transaction.atomic():
        locked_order = Order.objects.select_for_update().select_related('user').get(pk=order.pk)
        if locked_order.status == Order.Status.EXPIRED:
            raise ValidationError({'detail': 'This order has expired. Please create a new order.'})
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
    payment_status, amount=None, currency=None, provider_payment_reference='',
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
        if payment.currency != order.currency or (currency and currency != payment.currency):
            raise CallbackError('Payment currency does not match the order.')
        if provider == PaymentTransaction.Provider.MPESA and payment.currency != 'KES':
            raise CallbackError('M-Pesa transactions must use KES.')
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
            items = list(order.items.select_related('course'))
            courses = [item.course for item in items]
            _, created = Enrollment.objects.get_or_create(
                student=order.user,
                course=courses[0],
                defaults={'order': order},
            )
            additional_created = False
            for course in courses[1:]:
                _, enrolled = Enrollment.objects.get_or_create(
                    student=order.user,
                    course=course,
                    defaults={'order': order},
                )
                additional_created = additional_created or enrolled
            _record_redemption(order)
            if created or additional_created:
                email_details = (order, courses)
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
        _send_order_confirmation_email(*email_details)
    return False