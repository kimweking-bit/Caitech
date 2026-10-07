from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_student = models.BooleanField(default=True)
    is_instructor = models.BooleanField(default=False)
    is_verified_instructor = models.BooleanField(
        default=False,
        help_text="True only once an admin approves this account as a real instructor."
    )
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username


class NotificationEvent(models.Model):
    TYPE_REGISTRATION = 'registration'
    TYPE_ENROLMENT = 'enrolment'
    TYPE_CHOICES = [
        (TYPE_REGISTRATION, 'Registration'),
        (TYPE_ENROLMENT, 'Enrolment'),
    ]

    STATUS_SENT = 'sent'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_SENT, 'Sent'),
        (STATUS_FAILED, 'Failed'),
    ]

    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    recipient = models.EmailField()
    related_user = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SENT)
    error = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-pk']

    def __str__(self):
        return f'{self.type} -> {self.recipient} ({self.status})'