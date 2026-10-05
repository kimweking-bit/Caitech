import hashlib
import hmac
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .base import PaymentProvider, ProviderError


class HostedCheckoutProvider(PaymentProvider):
    def __init__(self, provider_name, checkout_url, webhook_secret):
        self.provider_name = provider_name
        self.checkout_url = checkout_url
        self.webhook_secret = webhook_secret

    def initiate_payment(self, transaction, *, callback_url, return_url):
        if not self.checkout_url:
            raise ProviderError(f'{self.provider_name.title()} hosted checkout is not configured.')
        parts = urlsplit(self.checkout_url)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        provider_reference = str(transaction.reference)
        query.update({
            'transaction_reference': provider_reference,
            'order_reference': str(transaction.order.reference),
            'amount': str(transaction.amount),
            'currency': transaction.currency,
            'callback_url': callback_url,
            'return_url': return_url,
        })
        redirect_url = urlunsplit((
            parts.scheme,
            parts.netloc,
            parts.path,
            urlencode(query),
            parts.fragment,
        ))
        return {'provider_reference': provider_reference, 'redirect_url': redirect_url}

    def verify_callback(self, *, body, headers, transaction, token=None):
        if not self.webhook_secret:
            return False
        supplied = headers.get('X-Provider-Signature', '')
        expected = hmac.new(self.webhook_secret.encode(), body, hashlib.sha256).hexdigest()
        return bool(supplied) and hmac.compare_digest(supplied, expected)