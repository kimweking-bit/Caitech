from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from courses.models import Course


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ['name', 'pk']

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ['name', 'pk']

    def __str__(self):
        return self.name


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    title = models.CharField(max_length=240)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(max_length=500)
    body = models.TextField()
    featured_image = models.ImageField(upload_to='blog/%Y/%m/', blank=True, null=True)
    published_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    categories = models.ManyToManyField(BlogCategory, related_name='posts', blank=True)
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-pk']

    def save(self, *args, **kwargs):
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class NewsletterSubscription(models.Model):
    email = models.EmailField(max_length=254)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-subscribed_at', '-pk']
        constraints = [
            models.UniqueConstraint(Lower('email'), name='unique_newsletter_email_ci'),
        ]

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class ContactInquiry(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=32)
    message = models.TextField(max_length=5000)
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        related_name='inquiries',
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-pk']

    def __str__(self):
        return f'{self.name} - {self.email}'
