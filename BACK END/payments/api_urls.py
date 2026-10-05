from django.urls import path

from .views import (
    CartCouponV1,
    CartCheckoutV1,
    CartItemDetailV1,
    CartV1,
    HostedProviderCallbackV1,
    MpesaCallbackV1,
    OrderCreateV1,
    OrderStatusV1,
    PaymentInitiateV1,
)

urlpatterns = [
    path('cart/', CartV1.as_view(), name='payments-cart'),
    path('cart/checkout/', CartCheckoutV1.as_view(), name='payments-cart-checkout'),
    path('cart/coupon/', CartCouponV1.as_view(), name='payments-cart-coupon'),
    path('cart/items/<int:course_id>/', CartItemDetailV1.as_view(), name='payments-cart-item-detail'),
    path('orders/', OrderCreateV1.as_view(), name='payments-order-create'),
    path(
        'orders/<uuid:order_reference>/initiate/',
        PaymentInitiateV1.as_view(),
        name='payments-order-initiate',
    ),
    path(
        'orders/<uuid:order_reference>/status/',
        OrderStatusV1.as_view(),
        name='payments-order-status',
    ),
    path(
        'callbacks/mpesa/<uuid:transaction_reference>/<str:token>/',
        MpesaCallbackV1.as_view(),
        name='payments-mpesa-callback',
    ),
    path(
        'callbacks/<str:provider>/',
        HostedProviderCallbackV1.as_view(),
        name='payments-hosted-callback',
    ),
]