import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Order(models.Model):
	class Status(models.TextChoices):
		DRAFT = 'draft', 'Draft'
		PENDING = 'pending', 'Pending'
		PAID = 'paid', 'Paid'
		FAILED = 'failed', 'Failed'
		CANCELLED = 'cancelled', 'Cancelled'
		EXPIRED = 'expired', 'Expired'

	reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
	currency = models.CharField(max_length=3, choices=[('KES', 'Kenyan Shilling'), ('USD', 'US Dollar')])
	customer_name = models.CharField(max_length=200, blank=True)
	customer_email = models.EmailField(blank=True)
	customer_phone = models.CharField(max_length=20, blank=True)
	subtotal = models.DecimalField(max_digits=10, decimal_places=2)
	discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	total = models.DecimalField(max_digits=10, decimal_places=2)
	coupon = models.ForeignKey(
		'Coupon', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
	)
	coupon_code = models.CharField(max_length=50, blank=True)
	expires_at = models.DateTimeField(blank=True, null=True)
	confirmation_email_sent = models.BooleanField(default=False)
	confirmation_email_last_attempt = models.DateTimeField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at', '-pk']
		constraints = [
			models.CheckConstraint(condition=Q(subtotal__gte=0), name='order_subtotal_nonnegative'),
			models.CheckConstraint(condition=Q(discount_amount__gte=0), name='order_discount_nonnegative'),
			models.CheckConstraint(condition=Q(fee_amount__gte=0), name='order_fee_nonnegative'),
			models.CheckConstraint(condition=Q(total__gte=0), name='order_total_nonnegative'),
		]

	def __str__(self):
		return str(self.reference)


class OrderItem(models.Model):
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	course = models.ForeignKey('courses.Course', on_delete=models.PROTECT, related_name='order_items')
	course_title = models.CharField(max_length=200)
	unit_price = models.DecimalField(max_digits=10, decimal_places=2)
	original_unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
	currency = models.CharField(max_length=3, choices=[('KES', 'Kenyan Shilling'), ('USD', 'US Dollar')])
	quantity = models.PositiveSmallIntegerField(default=1)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['order', 'course'], name='unique_course_per_order'),
			models.CheckConstraint(condition=Q(unit_price__gte=0), name='order_item_price_nonnegative'),
			models.CheckConstraint(
				condition=Q(original_unit_price__isnull=True) | Q(original_unit_price__gte=0),
				name='order_item_original_price_nonnegative',
			),
			models.CheckConstraint(condition=Q(quantity__gte=1), name='order_item_quantity_positive'),
		]


class Cart(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_cart')
	coupon_code = models.CharField(max_length=50, blank=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f'Cart for {self.user}'


class CartItem(models.Model):
	cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
	course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='cart_items')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at', 'pk']
		constraints = [
			models.UniqueConstraint(fields=['cart', 'course'], name='unique_course_per_cart'),
		]


class PaymentTransaction(models.Model):
	class Provider(models.TextChoices):
		MPESA = 'mpesa', 'M-Pesa'
		CARD = 'card', 'Card hosted checkout'
		PAYPAL = 'paypal', 'PayPal'

	class Status(models.TextChoices):
		INITIATED = 'initiated', 'Initiated'
		PENDING = 'pending', 'Pending'
		CONFIRMED = 'confirmed', 'Confirmed'
		FAILED = 'failed', 'Failed'
		CANCELLED = 'cancelled', 'Cancelled'
		EXPIRED = 'expired', 'Expired'

	class CallbackStatus(models.TextChoices):
		CONFIRMED = 'confirmed', 'Confirmed'
		FAILED = 'failed', 'Failed'
		CANCELLED = 'cancelled', 'Cancelled'
		EXPIRED = 'expired', 'Expired'

	reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')
	provider = models.CharField(max_length=20, choices=Provider.choices)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	currency = models.CharField(max_length=3, choices=[('KES', 'Kenyan Shilling'), ('USD', 'US Dollar')])
	provider_reference = models.CharField(max_length=150, blank=True, db_index=True)
	provider_payment_reference = models.CharField(max_length=150, blank=True)
	redirect_url = models.URLField(blank=True)
	phone_number = models.CharField(max_length=20, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	completed_at = models.DateTimeField(blank=True, null=True)

	class Meta:
		ordering = ['-created_at', '-pk']
		constraints = [
			models.CheckConstraint(condition=Q(amount__gte=0), name='payment_amount_nonnegative'),
		]


class Coupon(models.Model):
	class DiscountType(models.TextChoices):
		PERCENTAGE = 'percentage', 'Percentage'
		FIXED = 'fixed', 'Fixed amount'

	code = models.CharField(max_length=50, unique=True)
	discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	currency = models.CharField(
		max_length=3,
		choices=[('KES', 'Kenyan Shilling'), ('USD', 'US Dollar')],
		default='KES',
	)
	course = models.ForeignKey(
		'courses.Course', on_delete=models.CASCADE, null=True, blank=True, related_name='coupons'
	)
	minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	max_redemptions = models.PositiveIntegerField(blank=True, null=True)
	per_user_limit = models.PositiveIntegerField(default=1)
	starts_at = models.DateTimeField(blank=True, null=True)
	expires_at = models.DateTimeField(blank=True, null=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.CheckConstraint(condition=Q(amount__gt=0), name='coupon_amount_positive'),
			models.CheckConstraint(
				condition=Q(discount_type='percentage', amount__lte=100)
				| Q(discount_type='fixed'),
				name='coupon_percentage_at_most_100',
			),
			models.CheckConstraint(
				condition=Q(per_user_limit__gte=1), name='coupon_per_user_limit_positive'
			),
		]

	def save(self, *args, **kwargs):
		self.code = self.code.strip().upper()
		super().save(*args, **kwargs)

	def __str__(self):
		return self.code


class CouponRedemption(models.Model):
	coupon = models.ForeignKey(Coupon, on_delete=models.PROTECT, related_name='redemptions')
	order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name='coupon_redemption')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='coupon_redemptions')
	discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
	redeemed_at = models.DateTimeField(default=timezone.now)

	class Meta:
		ordering = ['-redeemed_at', '-pk']
