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

    def __str__(self):
        return self.username