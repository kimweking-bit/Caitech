from decimal import Decimal

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db.models import Avg, Count, OuterRef, Q, Subquery, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST
from rest_framework.exceptions import ValidationError as ApiValidationError

from payments.cart import add_course_to_cart, get_user_cart, merge_guest_cart, remove_course_from_cart
from payments.models import CartItem, Order, PaymentTransaction
from payments.providers import ProviderError, callback_token
from payments.services import (
    create_course_order_for_courses,
    expire_order_if_stale,
    initiate_payment,
    quote_course_order,
)

from .models import Course, Enrollment, Lesson, LessonProgress
from .permissions import user_can_manage_course

User = get_user_model()
GUEST_CART_KEY = 'cai_guest_course_cart'
GUEST_COUPON_KEY = 'cai_guest_coupon'


def _visible_courses(user):
    queryset = Course.objects.filter(is_published=True)
    if user.is_authenticated and user.is_staff:
        queryset = Course.objects.all()
    elif user.is_authenticated and getattr(user, 'is_verified_instructor', False):
        queryset = Course.objects.filter(Q(is_published=True) | Q(instructor=user))
    return queryset


def _catalog_queryset(user):
    lesson_duration = Lesson.objects.filter(course_id=OuterRef('pk')).order_by().values(
        'course_id'
    ).annotate(total=Sum('duration_minutes')).values('total')[:1]
    return _visible_courses(user).select_related('category', 'instructor').annotate(
        average_rating=Avg('reviews__rating'),
        enrolled_count=Count('enrollments', distinct=True),
        total_duration_minutes=Subquery(lesson_duration),
        active_order_reservations=Count(
            'order_items',
            filter=Q(
                order_items__order__status__in=[Order.Status.DRAFT, Order.Status.PENDING],
                order_items__order__expires_at__gt=timezone.now(),
            ),
            distinct=True,
        ),
    ).order_by('-created_at', '-pk')


def _owned_course_ids(user):
    if not user.is_authenticated:
        return set()
    return set(Enrollment.objects.filter(student=user).values_list('course_id', flat=True))


def _cart_coupon(request):
    if request.user.is_authenticated:
        return get_user_cart(request.user).coupon_code
    return request.session.get(GUEST_COUPON_KEY, '')


def _cart_courses(request):
    if request.user.is_authenticated:
        cart = get_user_cart(request.user)
        items = list(
            CartItem.objects.filter(cart=cart, course__is_published=True)
            .exclude(course__enrollments__student=request.user)
            .select_related('course', 'course__category', 'course__instructor')
            .order_by('created_at', 'pk')
        )
        courses = [item.course for item in items]
        valid_ids = {course.pk for course in courses}
        CartItem.objects.filter(cart=cart).exclude(course_id__in=valid_ids).delete()
        return courses

    ids = request.session.get(GUEST_CART_KEY, [])
    courses = list(
        Course.objects.filter(pk__in=ids, is_published=True)
        .select_related('category', 'instructor')
        .order_by('created_at', 'pk')
    )
    request.session[GUEST_CART_KEY] = [course.pk for course in courses]
    return courses


def _cart_context(request, *, coupon_code=None, coupon_error=''):
    courses = _cart_courses(request)
    code = _cart_coupon(request) if coupon_code is None else coupon_code
    quote = {
        'subtotal': Decimal('0.00'),
        'discount_amount': Decimal('0.00'),
        'fee_amount': Decimal('0.00'),
        'total': Decimal('0.00'),
        'coupon': None,
    }
    quote_error = coupon_error
    currencies = {course.currency for course in courses}
    if courses and len(currencies) == 1:
        try:
            quote = quote_course_order(
                user=request.user if request.user.is_authenticated else None,
                courses=courses,
                coupon_code=code,
            )
        except ApiValidationError as exc:
            if code:
                quote_error = '; '.join(
                    str(message)
                    for value in exc.detail.values()
                    for message in (value if isinstance(value, list) else [value])
                )
                code = ''
                quote = quote_course_order(
                    user=request.user if request.user.is_authenticated else None,
                    courses=courses,
                )
    elif len(currencies) > 1:
        quote_error = 'Your cart has more than one currency. Complete a separate order for each currency.'
        quote['subtotal'] = sum((course.price for course in courses), Decimal('0.00'))
        quote['total'] = quote['subtotal']

    return {
        'cart_courses': courses,
        'cart_count': len(courses),
        'coupon_code': code,
        'coupon_error': quote_error,
        'subtotal': quote['subtotal'],
        'discount_amount': quote['discount_amount'],
        'fee_amount': quote['fee_amount'],
        'total': quote['total'],
        'currency': next(iter(currencies), 'KES'),
        'can_checkout': (
            bool(courses)
            and len(currencies) == 1
            and not quote_error
            and all(course.is_available for course in courses)
        ),
    }


def catalog(request):
    courses = _catalog_queryset(request.user)
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', '').strip()
    if query:
        courses = courses.filter(Q(title__icontains=query) | Q(description__icontains=query))
    if category:
        courses = courses.filter(category__slug=category)
    context = {
        'courses': courses,
        'categories': Course._meta.get_field('category').remote_field.model.objects.order_by('name'),
        'query': query,
        'selected_category': category,
        'owned_course_ids': _owned_course_ids(request.user),
        'cart_count': len(_cart_courses(request)),
    }
    return render(request, 'courses/storefront/catalog.html', context)


def course_detail(request, slug):
    course = get_object_or_404(
        _catalog_queryset(request.user).prefetch_related('sections__lessons'),
        slug=slug,
    )
    owned = request.user.is_authenticated and Enrollment.objects.filter(
        student=request.user,
        course=course,
    ).exists()
    return render(request, 'courses/storefront/course_detail.html', {
        'course': course,
        'owned': owned,
        'can_manage': user_can_manage_course(request.user, course),
        'cart_count': len(_cart_courses(request)),
    })


@require_POST
def add_to_cart(request, course_id):
    course = get_object_or_404(_visible_courses(request.user), pk=course_id, is_published=True)
    if request.user.is_authenticated:
        try:
            add_course_to_cart(user=request.user, course_id=course.pk)
        except ApiValidationError as exc:
            messages.error(request, str(exc.detail))
            return redirect('storefront-course-detail', slug=course.slug)
    else:
        ids = request.session.get(GUEST_CART_KEY, [])
        if course.pk not in ids:
            ids.append(course.pk)
        request.session[GUEST_CART_KEY] = ids
    messages.success(request, f'{course.title} was added to your cart.')
    return redirect('storefront-cart')


def cart(request):
    return render(request, 'courses/storefront/cart.html', _cart_context(request))


@require_POST
def remove_from_cart(request, course_id):
    if request.user.is_authenticated:
        remove_course_from_cart(cart=get_user_cart(request.user), course_id=course_id)
    else:
        request.session[GUEST_CART_KEY] = [
            pk for pk in request.session.get(GUEST_CART_KEY, []) if int(pk) != course_id
        ]
    messages.info(request, 'Course removed from your cart.')
    return redirect('storefront-cart')


@require_POST
def apply_cart_coupon(request):
    code = request.POST.get('coupon_code', '').strip()
    context = _cart_context(request, coupon_code=code)
    if context['coupon_error']:
        return render(request, 'courses/storefront/cart.html', context, status=400)
    if request.user.is_authenticated:
        cart = get_user_cart(request.user)
        cart.coupon_code = code.upper()
        cart.save(update_fields=['coupon_code', 'updated_at'])
    else:
        request.session[GUEST_COUPON_KEY] = code.upper()
    messages.success(request, 'Coupon applied.')
    return redirect('storefront-cart')


@require_POST
def remove_cart_coupon(request):
    if request.user.is_authenticated:
        cart = get_user_cart(request.user)
        cart.coupon_code = ''
        cart.save(update_fields=['coupon_code', 'updated_at'])
    else:
        request.session.pop(GUEST_COUPON_KEY, None)
    return redirect('storefront-cart')


def _clear_cart(request):
    if request.user.is_authenticated:
        cart = get_user_cart(request.user)
        cart.items.all().delete()
        cart.coupon_code = ''
        cart.save(update_fields=['coupon_code', 'updated_at'])
    request.session.pop(GUEST_CART_KEY, None)
    request.session.pop(GUEST_COUPON_KEY, None)


def checkout(request):
    if not request.user.is_authenticated:
        return redirect(f'{reverse("storefront-login")}?next={reverse("storefront-checkout")}')
    context = _cart_context(request)
    if not context['cart_courses']:
        messages.info(request, 'Add a course before checkout.')
        return redirect('storefront-cart')

    if request.method == 'POST':
        full_name = request.POST.get('full_name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone_number', '').strip()
        phone_digits = ''.join(character for character in phone if character.isdigit())
        errors = []
        if not full_name:
            errors.append('Enter your full name.')
        try:
            validate_email(email)
        except DjangoValidationError:
            errors.append('Enter a valid email address.')
        if len(phone_digits) not in (10, 12) or not phone_digits.startswith(('0', '254')):
            errors.append('Enter a valid Kenyan phone number for M-Pesa.')
        if not context['can_checkout']:
            errors.append(context['coupon_error'] or 'Your cart cannot be checked out yet.')
        if errors:
            context.update({
                'form_errors': errors,
                'form_name': full_name,
                'form_email': email,
                'form_phone': phone,
            })
            return render(request, 'courses/storefront/checkout.html', context, status=400)

        try:
            order = create_course_order_for_courses(
                user=request.user,
                courses=context['cart_courses'],
                coupon_code=context['coupon_code'],
                customer_name=full_name,
                customer_email=email,
                customer_phone=phone,
            )
        except ApiValidationError as exc:
            context['form_errors'] = [str(exc.detail)]
            return render(request, 'courses/storefront/checkout.html', context, status=400)

        if order.status == Order.Status.PAID:
            _clear_cart(request)
            return redirect('storefront-payment-return', order_reference=order.reference)

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
                method=PaymentTransaction.Provider.MPESA,
                phone_number=phone,
                callback_url=callback_url,
                return_url=return_url,
            )
        except (ProviderError, ApiValidationError) as exc:
            context['form_errors'] = [str(getattr(exc, 'detail', exc))]
            context['order_created'] = order
            return render(request, 'courses/storefront/checkout.html', context, status=502)

        _clear_cart(request)
        if payment.redirect_url:
            return redirect(payment.redirect_url)
        return redirect('storefront-payment-return', order_reference=order.reference)

    context.update({
        'form_name': request.user.get_full_name(),
        'form_email': request.user.email,
        'form_phone': request.user.phone_number,
    })
    return render(request, 'courses/storefront/checkout.html', context)


def payment_return(request, order_reference):
    if not request.user.is_authenticated:
        return redirect(f'{reverse("storefront-login")}?next={request.path}')
    order = get_object_or_404(
        Order.objects.prefetch_related('items__course', 'transactions'),
        reference=order_reference,
        user=request.user,
    )
    return render(request, 'courses/storefront/payment_return.html', {'order': order})


def payment_status(request, order_reference):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Authentication required.'}, status=401)
    order = get_object_or_404(
        Order.objects.prefetch_related('items'),
        reference=order_reference,
        user=request.user,
    )
    order = expire_order_if_stale(order)
    return JsonResponse({
        'status': order.status,
        'order_number': f'CAI-{str(order.reference).split("-")[0].upper()}',
        'currency': order.currency,
        'total': str(order.total),
        'courses': [item.course_title for item in order.items.all()],
    })


def dashboard(request):
    if not request.user.is_authenticated:
        return redirect(f'{reverse("storefront-login")}?next={reverse("storefront-dashboard")}')
    enrollments = Enrollment.objects.filter(student=request.user).select_related(
        'course', 'course__instructor'
    ).prefetch_related('course__lessons', 'lesson_progress').order_by('-enrolled_at')
    for enrollment in enrollments:
        total = len(enrollment.course.lessons.all())
        completed = sum(progress.completed for progress in enrollment.lesson_progress.all())
        enrollment.progress_percentage = round(completed * 100 / total, 2) if total else 0
    return render(request, 'courses/storefront/dashboard.html', {
        'enrollments': enrollments,
        'cart_count': len(_cart_courses(request)),
    })


def course_room(request, slug):
    course = get_object_or_404(Course.objects.select_related('instructor'), slug=slug, is_published=True)
    if not request.user.is_authenticated:
        return redirect(f'{reverse("storefront-login")}?next={request.path}')
    enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
    if not enrollment and not user_can_manage_course(request.user, course):
        if course.price == 0:
            return redirect('storefront-free-enroll', slug=course.slug)
        messages.error(request, 'Purchase this course to access its lessons.')
        return redirect('storefront-course-detail', slug=course.slug)
    sections = course.sections.prefetch_related('lessons').all()
    standalone_lessons = course.lessons.filter(section__isnull=True)
    return render(request, 'courses/storefront/course_room.html', {
        'course': course,
        'sections': sections,
        'standalone_lessons': standalone_lessons,
        'enrollment': enrollment,
    })


@require_POST
def enroll_free(request, slug):
    if not request.user.is_authenticated:
        return redirect(f'{reverse("storefront-login")}?next={reverse("storefront-course-detail", kwargs={"slug": slug})}')
    course = get_object_or_404(Course, slug=slug, is_published=True, price=0)
    try:
        create_course_order_for_courses(
            user=request.user,
            courses=[course],
            customer_name=request.user.get_full_name(),
            customer_email=request.user.email,
            customer_phone=request.user.phone_number,
        )
    except ApiValidationError as exc:
        messages.error(request, str(exc.detail))
        return redirect('storefront-course-detail', slug=course.slug)
    return redirect('storefront-course-room', slug=course.slug)


def login_page(request):
    next_url = request.POST.get('next') or request.GET.get('next') or reverse('storefront-dashboard')
    if request.user.is_authenticated:
        return redirect(next_url if url_has_allowed_host_and_scheme(next_url, {request.get_host()}) else 'storefront-dashboard')
    error = ''
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            guest_ids = request.session.get(GUEST_CART_KEY, [])
            guest_coupon = request.session.get(GUEST_COUPON_KEY, '')
            login(request, user)
            merge_guest_cart(user=user, course_ids=guest_ids, coupon_code=guest_coupon)
            request.session.pop(GUEST_CART_KEY, None)
            request.session.pop(GUEST_COUPON_KEY, None)
            safe_next = next_url if url_has_allowed_host_and_scheme(next_url, {request.get_host()}) else reverse('storefront-dashboard')
            return redirect(safe_next)
        error = 'Those sign-in details do not match an account.'
    return render(request, 'courses/storefront/login.html', {'next': next_url, 'form_error': error})


def register_page(request):
    next_url = request.POST.get('next') or request.GET.get('next') or reverse('storefront-dashboard')
    errors = []
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        full_name = request.POST.get('full_name', '').strip()
        phone = request.POST.get('phone_number', '').strip()
        password = request.POST.get('password', '')
        if not username or not full_name:
            errors.append('Enter your name and a username.')
        try:
            validate_email(email)
        except DjangoValidationError:
            errors.append('Enter a valid email address.')
        if User.objects.filter(email__iexact=email).exists():
            errors.append('An account already uses that email address.')
        if User.objects.filter(username__iexact=username).exists():
            errors.append('That username is already taken.')
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            errors.extend(exc.messages)
        if not errors:
            first_name, _, last_name = full_name.partition(' ')
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone,
            )
            guest_ids = request.session.get(GUEST_CART_KEY, [])
            guest_coupon = request.session.get(GUEST_COUPON_KEY, '')
            login(request, user)
            merge_guest_cart(user=user, course_ids=guest_ids, coupon_code=guest_coupon)
            request.session.pop(GUEST_CART_KEY, None)
            request.session.pop(GUEST_COUPON_KEY, None)
            safe_next = next_url if url_has_allowed_host_and_scheme(next_url, {request.get_host()}) else reverse('storefront-dashboard')
            return redirect(safe_next)
    return render(request, 'courses/storefront/register.html', {'next': next_url, 'form_errors': errors})


@require_POST
def logout_page(request):
    logout(request)
    return redirect('storefront-catalog')