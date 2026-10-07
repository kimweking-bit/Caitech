from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from .models import Order, OrderItem, PaymentTransaction


class CartAddSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(min_value=1)


class CartCouponSerializer(serializers.Serializer):
    coupon_code = serializers.CharField(max_length=50)


class CartLineSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    image = serializers.CharField(allow_null=True)
    currency = serializers.CharField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)


class CartResponseSerializer(serializers.Serializer):
    items = CartLineSerializer(many=True)
    currency = serializers.CharField(allow_blank=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    fee_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    coupon_code = serializers.CharField(allow_blank=True)


class OrderCreateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(min_value=1)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    customer_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)


class CartCheckoutSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)


class OrderItemResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['course_title', 'unit_price', 'currency', 'quantity']


class PaymentTransactionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['reference', 'provider', 'status', 'amount', 'currency', 'redirect_url']


class OrderResponseSerializer(serializers.ModelSerializer):
    items = OrderItemResponseSerializer(many=True, read_only=True)
    latest_transaction = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'reference', 'status', 'currency', 'subtotal', 'discount_amount',
            'fee_amount', 'total', 'expires_at',
            'coupon_code', 'items', 'latest_transaction', 'created_at', 'updated_at',
        ]

    @extend_schema_field(PaymentTransactionResponseSerializer(allow_null=True))
    def get_latest_transaction(self, order):
        payment = order.transactions.first()
        if payment is None:
            return None
        return PaymentTransactionResponseSerializer(payment).data


def _contains_card_data(data):
    blocked_fragments = ('cardnumber', 'card_number', 'cvv', 'cvc', 'securitycode', 'security_code', 'pan')
    return any(
        fragment in str(key).lower().replace('-', '').replace(' ', '')
        for key in data
        for fragment in blocked_fragments
    )


class PaymentInitiateSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=PaymentTransaction.Provider.choices)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate(self, attrs):
        if _contains_card_data(self.initial_data):
            raise serializers.ValidationError(
                'Card details are not accepted. Complete payment on the provider-hosted page.'
            )
        if attrs['method'] == PaymentTransaction.Provider.MPESA:
            phone_number = attrs.get('phone_number', '').strip()
            if not phone_number:
                raise serializers.ValidationError({'phone_number': 'This field is required for M-Pesa.'})
            digits = ''.join(character for character in phone_number if character.isdigit())
            if len(digits) not in (10, 12) or not digits.startswith(('0', '254')):
                raise serializers.ValidationError({'phone_number': 'Enter a valid Kenyan phone number.'})
            attrs['phone_number'] = phone_number
        elif attrs.get('phone_number'):
            raise serializers.ValidationError({'phone_number': 'Only M-Pesa accepts a phone number.'})
        return attrs


class PaymentInitiationResponseSerializer(serializers.Serializer):
    order_reference = serializers.UUIDField()
    order_status = serializers.ChoiceField(choices=Order.Status.choices)
    transaction_reference = serializers.UUIDField()
    provider = serializers.ChoiceField(choices=PaymentTransaction.Provider.choices)
    payment_status = serializers.ChoiceField(choices=PaymentTransaction.Status.choices)
    redirect_url = serializers.URLField(allow_blank=True)


class HostedProviderCallbackSerializer(serializers.Serializer):
    transaction_reference = serializers.UUIDField()
    order_reference = serializers.UUIDField()
    provider_reference = serializers.CharField(max_length=150)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    currency = serializers.ChoiceField(choices=[('KES', 'KES'), ('USD', 'USD')])
    status = serializers.ChoiceField(choices=PaymentTransaction.CallbackStatus.choices)
    provider_payment_reference = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate(self, attrs):
        if _contains_card_data(self.initial_data):
            raise serializers.ValidationError('Card data must never be sent to this callback.')
        return attrs


class MpesaCallbackRequestSerializer(serializers.Serializer):
    Body = serializers.DictField()


class CallbackResponseSerializer(serializers.Serializer):
    received = serializers.BooleanField()
    duplicate = serializers.BooleanField()