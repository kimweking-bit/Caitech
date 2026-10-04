from django.urls import path

from .views import LearningPathQuestionnaireV1, LearningPathResponseListV1

urlpatterns = [
    path('', LearningPathQuestionnaireV1.as_view(), name='api-v1-ai-path-submit'),
    path('responses/', LearningPathResponseListV1.as_view(), name='api-v1-ai-path-responses'),
]
