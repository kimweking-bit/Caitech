import hmac

from django.conf import settings

from .base import PaymentProvider, ProviderError
from .hosted import HostedCheckoutProvider
from .mpesa import MpesaProvider


def get_provider(method, *, for_callback=False):
    if method == 'mpesa':
        return MpesaProvider()
    if method == 'card':
        if not for_callback:
            raise ProviderError('Hosted card checkout is not enabled until a real provider adapter is configured.')
        return HostedCheckoutProvider(
            method,
            settings.CARD_HOSTED_CHECKOUT_URL,
            settings.CARD_WEBHOOK_SECRET,
        )
    if method == 'paypal':
        if not for_callback:
            raise ProviderError('PayPal checkout is not enabled until a real provider adapter is configured.')
        return HostedCheckoutProvider(
            method,
            settings.PAYPAL_HOSTED_CHECKOUT_URL,
            settings.PAYPAL_WEBHOOK_SECRET,
        )
    raise ProviderError('Unsupported payment method.')


def callback_token(transaction):
    secret = settings.MPESA_CALLBACK_SECRET
    if not secret:
        raise ProviderError('M-Pesa callback authentication is not configured.')
    message = f'{transaction.reference}:{transaction.order.reference}'.encode()
    return hmac.new(secret.encode(), message, 'sha256').hexdigest()


__all__ = ['PaymentProvider', 'ProviderError', 'callback_token', 'get_provider']