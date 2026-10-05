import logging

from django.conf import settings
from django.core import mail

from .models import NotificationEvent

logger = logging.getLogger(__name__)


def send_notification_email(notification_type, recipient, subject, message, related_user=None):
    if not recipient:
        return False

    try:
        mail.send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception(
            'Failed to send %s email to %s',
            notification_type,
            recipient,
        )
        NotificationEvent.objects.create(
            type=notification_type,
            recipient=recipient,
            status='failed',
            error=str(exc),
            related_user=related_user,
        )
        return False

    NotificationEvent.objects.create(
        type=notification_type,
        recipient=recipient,
        status='sent',
        related_user=related_user,
    )
    return True
