from django.db import models


class LearningPathResponse(models.Model):
	class Status(models.TextChoices):
		PENDING = 'pending', 'Pending'
		COMPLETED = 'completed', 'Completed'
		FAILED = 'failed', 'Failed'

	goals = models.TextField(max_length=2000)
	current_skill_level = models.CharField(max_length=40)
	interests = models.TextField(max_length=2000)
	hours_per_week = models.PositiveSmallIntegerField()
	name = models.CharField(max_length=120, blank=True)
	email = models.EmailField(max_length=254, blank=True)
	phone = models.CharField(max_length=32, blank=True)
	recommendations = models.JSONField(default=list, blank=True)
	recommendation_summary = models.TextField(blank=True)
	provider = models.CharField(max_length=80, blank=True)
	model = models.CharField(max_length=160, blank=True)
	status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
	error_code = models.CharField(max_length=40, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(blank=True, null=True)

	class Meta:
		ordering = ['-created_at', '-pk']

	def __str__(self):
		return f'Learning path {self.pk} ({self.status})'
