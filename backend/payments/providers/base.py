from abc import ABC, abstractmethod


class ProviderError(Exception):
    pass


class PaymentProvider(ABC):
    @abstractmethod
    def initiate_payment(self, transaction, *, callback_url, return_url):
        raise NotImplementedError

    @abstractmethod
    def verify_callback(self, *, body, headers, transaction, token=None):
        raise NotImplementedError