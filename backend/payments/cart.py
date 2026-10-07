from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from courses.models import Course, Enrollment

from .models import Cart, CartItem, Order, OrderItem


def get_user_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@transaction.atomic
def add_course_to_cart(*, user, course_id):
    cart = get_user_cart(user)
    try:
        course = Course.objects.select_for_update().get(pk=course_id, is_published=True)
    except Course.DoesNotExist as exc:
        raise ValidationError({'course_id': 'This course is not available.'}) from exc
    if course.intake_status == Course.IntakeStatus.CLOSED:
        raise ValidationError({'course_id': 'Enrollment for this course is closed.'})
    if Enrollment.objects.filter(student=user, course=course).exists():
        raise ValidationError({'course_id': 'You already own this course.'})
    if OrderItem.objects.filter(
        course=course,
        order__user=user,
        order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
        order__expires_at__gt=timezone.now(),
    ).exists():
        raise ValidationError({'course_id': 'This course is already in an active order.'})
    if course.seat_capacity is not None:
        reservations = OrderItem.objects.filter(
            course=course,
            order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
            order__expires_at__gt=timezone.now(),
        ).count()
        if course.enrollments.count() + reservations >= course.seat_capacity:
            raise ValidationError({'course_id': 'This course has no seats available.'})
    item, created = CartItem.objects.get_or_create(cart=cart, course=course)
    return item, created


def remove_course_from_cart(*, cart, course_id):
    return CartItem.objects.filter(cart=cart, course_id=course_id).delete()[0] > 0


def merge_guest_cart(*, user, course_ids, coupon_code=''):
    cart = get_user_cart(user)
    available = Course.objects.filter(pk__in=set(course_ids), is_published=True).exclude(
        enrollments__student=user
    )
    for course in available:
        CartItem.objects.get_or_create(cart=cart, course=course)
    if coupon_code:
        cart.coupon_code = coupon_code[:50]
        cart.save(update_fields=['coupon_code', 'updated_at'])
    return cart