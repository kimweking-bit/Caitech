from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None and response.status_code >= 500:
        if settings.DEBUG:
            return response
        response.data = {'detail': 'A server error occurred.'}

    if response is not None and response.status_code == 404 and not settings.DEBUG:
        response.data = {'detail': 'The requested resource was not found.'}

    return response
