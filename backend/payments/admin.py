from django.contrib import admin
from .models import Cart, CartItem, Coupon, CouponRedemption, Order, OrderItem, PaymentTransaction
from .services import _send_order_confirmation_email


class OrderItemInline(admin.TabularInline):
	model = OrderItem
	extra = 0
	can_delete = False
	readonly_fields = ('course', 'course_title', 'unit_price', 'original_unit_price', 'currency', 'quantity')


class PaymentTransactionInline(admin.TabularInline):
	model = PaymentTransaction
	extra = 0
	can_delete = False
	readonly_fields = (
		'reference', 'provider', 'status', 'amount', 'currency', 'provider_reference',
		'provider_payment_reference', 'created_at', 'completed_at',
	)
	fields = readonly_fields


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ('reference', 'customer_name', 'customer_email', 'status', 'total', 'currency', 'confirmation_email_sent', 'created_at')
	list_filter = ('status', 'currency', 'created_at')
	search_fields = ('reference', 'customer_name', 'customer_email', 'user__username', 'user__email')
	readonly_fields = (
		'reference', 'user', 'status', 'currency', 'customer_name', 'customer_email',
		'customer_phone', 'subtotal', 'discount_amount', 'fee_amount', 'total',
		'coupon', 'coupon_code', 'expires_at', 'confirmation_email_sent',
		'confirmation_email_last_attempt', 'created_at', 'updated_at',
	)
	inlines = (OrderItemInline, PaymentTransactionInline)
	list_select_related = ('user', 'coupon')
	date_hierarchy = 'created_at'
	actions = ('retry_confirmation_email',)

	@admin.action(description='Retry unsent course confirmation emails')
	def retry_confirmation_email(self, request, queryset):
		retried = 0
		for order in queryset.filter(status=Order.Status.PAID, confirmation_email_sent=False):
			courses = [item.course for item in order.items.select_related('course')]
			if _send_order_confirmation_email(order, courses):
				retried += 1
		self.message_user(request, f'{retried} confirmation email(s) sent.')


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
	list_display = ('reference', 'order', 'provider', 'status', 'amount', 'currency', 'provider_reference', 'created_at')
	list_filter = ('provider', 'status', 'currency', 'created_at')
	search_fields = ('reference', 'provider_reference', 'provider_payment_reference', 'order__reference')
	readonly_fields = tuple(field.name for field in PaymentTransaction._meta.fields)
	list_select_related = ('order', 'order__user')


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
	list_display = ('code', 'discount_type', 'amount', 'currency', 'course', 'is_active', 'starts_at', 'expires_at')
	list_filter = ('is_active', 'discount_type', 'currency')
	search_fields = ('code', 'course__title')
	list_select_related = ('course',)


@admin.register(CouponRedemption)
class CouponRedemptionAdmin(admin.ModelAdmin):
	list_display = ('coupon', 'user', 'order', 'discount_amount', 'redeemed_at')
	list_filter = ('coupon', 'redeemed_at')
	search_fields = ('coupon__code', 'user__username', 'order__reference')
	readonly_fields = tuple(field.name for field in CouponRedemption._meta.fields)


class CartItemInline(admin.TabularInline):
	model = CartItem
	extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
	list_display = ('user', 'coupon_code', 'updated_at')
	search_fields = ('user__username', 'user__email')
	inlines = (CartItemInline,)
