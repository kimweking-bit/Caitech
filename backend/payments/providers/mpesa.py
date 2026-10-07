import base64
import hmac
from datetime import datetime
from zoneinfo import ZoneInfo

import requests
from django.conf import settings

from .base import PaymentProvider, ProviderError


class MpesaProvider(PaymentProvider):
    def _required_setting(self, name):
        value = getattr(settings, name, '')
        if not value:
            raise ProviderError(f'{name} is not configured.')
        return value

    def _access_token(self):
        key = self._required_setting('MPESA_CONSUMER_KEY')
        secret = self._required_setting('MPESA_CONSUMER_SECRET')
        base_url = settings.MPESA_BASE_URL.rstrip('/')
        try:
            response = requests.get(
                f'{base_url}/oauth/v1/generate?grant_type=client_credentials',
                auth=(key, secret),
                timeout=settings.PAYMENT_REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            token = response.json().get('access_token')
        except (requests.RequestException, ValueError) as exc:
            raise ProviderError('Unable to authenticate with M-Pesa.') from exc
        if not token:
            raise ProviderError('M-Pesa did not return an access token.')
        return token

    def initiate_payment(self, transaction, *, callback_url, return_url):
        if transaction.currency != 'KES' or transaction.amount != transaction.amount.to_integral_value():
            raise ProviderError('M-Pesa requires a whole-number amount in KES.')

        shortcode = self._required_setting('MPESA_SHORTCODE')
        passkey = self._required_setting('MPESA_PASSKEY')
        timestamp = datetime.now(ZoneInfo('Africa/Nairobi')).strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f'{shortcode}{passkey}{timestamp}'.encode()).decode()
        phone_number = ''.join(character for character in transaction.phone_number if character.isdigit())
        if phone_number.startswith('0'):
            phone_number = f'254{phone_number[1:]}'
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]
        if not phone_number.startswith('254') or len(phone_number) != 12:
            raise ProviderError('Enter a valid Kenyan M-Pesa phone number.')

        payload = {
            'BusinessShortCode': shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': settings.MPESA_TRANSACTION_TYPE,
            'Amount': int(transaction.amount),
            'PartyA': phone_number,
            'PartyB': shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': callback_url,
            'AccountReference': transaction.order.reference.hex[:12],
            'TransactionDesc': f'Course order {transaction.order.reference.hex[:12]}',
        }
        try:
            response = requests.post(
                f'{settings.MPESA_BASE_URL.rstrip("/")}/mpesa/stkpush/v1/processrequest',
                json=payload,
                headers={'Authorization': f'Bearer {self._access_token()}'},
                timeout=settings.PAYMENT_REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            result = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise ProviderError('Unable to initiate the M-Pesa payment.') from exc

        provider_reference = result.get('CheckoutRequestID')
        if not provider_reference or result.get('ResponseCode') not in (None, '0', 0):
            raise ProviderError('M-Pesa did not accept the payment request.')
        return {'provider_reference': provider_reference, 'redirect_url': ''}

    def verify_callback(self, *, body, headers, transaction, token=None):
        from . import callback_token

        try:
            expected = callback_token(transaction)
        except ProviderError:
            return False
        return bool(token) and hmac.compare_digest(token, expected)