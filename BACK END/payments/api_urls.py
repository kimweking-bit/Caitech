from django.urls import path

from .views import (
    HostedProviderCallbackV1,
    MpesaCallbackV1,
    OrderCreateV1,
    OrderStatusV1,
    PaymentInitiateV1,
)

urlpatterns = [
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