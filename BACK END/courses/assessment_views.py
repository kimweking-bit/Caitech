from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .assessment_permissions import (
    AssessmentAccessPermission,
    SubmissionAccessPermission,
    user_is_enrolled,
)
from .assessment_serializers import (
    AssignmentGradeSerializer,
    AssignmentSubmissionCreateSerializer,
    AssignmentSubmissionResultSerializer,
    AssignmentWriteSerializer,
    ChoiceWriteSerializer,
    InstructorChoiceSerializer,
    InstructorQuizSerializer,
    InstructorQuestionSerializer,
    QuizAttemptResultSerializer,
    QuizAttemptSubmitSerializer,
    QuizWriteSerializer,
    QuestionWriteSerializer,
    StudentChoiceSerializer,
    StudentQuizSerializer,
    StudentQuestionSerializer,
)
from .models import (
    Assignment,
    AssignmentSubmission,
    Choice,
    Course,
    Enrollment,
    Question,
    Quiz,
    QuizAttempt,
)
from .permissions import user_can_manage_course


class AssessmentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class QuizListCreateV1(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AssessmentPagination

    def get_course(self):
        return get_object_or_404(Course, slug=self.kwargs['course_slug'])

    def get_queryset(self):
        course = self.get_course()
        if not user_can_manage_course(self.request.user, course) and not user_is_enrolled(
            self.request.user, course
        ):
            raise PermissionDenied('Only enrolled students can access this course quiz.')
        return Quiz.objects.filter(course=course).prefetch_related(
            'questions__choices'
        ).order_by('created_at', 'pk')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuizWriteSerializer
        if user_can_manage_course(self.request.user, self.get_course()):
            return InstructorQuizSerializer
        return StudentQuizSerializer

    def perform_create(self, serializer):
        course = self.get_course()
        if not user_can_manage_course(self.request.user, course):
            raise PermissionDenied('Only the course owner or an admin can manage quizzes.')
        serializer.save(course=course)


class QuizDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.select_related('course').prefetch_related('questions__choices')
    permission_classes = [AssessmentAccessPermission]

    def get_serializer_class(self):
        if self.request.method in {'PATCH', 'PUT', 'DELETE'}:
            return QuizWriteSerializer
        if user_can_manage_course(self.request.user, self.get_object().course):
            return InstructorQuizSerializer
        return StudentQuizSerializer


class QuizQuestionListCreateV1(generics.ListCreateAPIView):
    permission_classes = [AssessmentAccessPermission]
    pagination_class = AssessmentPagination

    def get_quiz(self):
        return get_object_or_404(Quiz.objects.select_related('course'), pk=self.kwargs['quiz_pk'])

    def get_queryset(self):
        quiz = self.get_quiz()
        if not user_can_manage_course(self.request.user, quiz.course) and not user_is_enrolled(
            self.request.user, quiz.course
        ):
            raise PermissionDenied('Only enrolled students can access this quiz.')
        return Question.objects.filter(quiz=quiz).prefetch_related('choices')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuestionWriteSerializer
        if user_can_manage_course(self.request.user, self.get_quiz().course):
            return InstructorQuestionSerializer
        return StudentQuestionSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['quiz'] = self.get_quiz()
        return context

    def perform_create(self, serializer):
        quiz = self.get_quiz()
        if not user_can_manage_course(self.request.user, quiz.course):
            raise PermissionDenied('Only the course owner or an admin can manage quiz questions.')
        serializer.save(quiz=quiz)


class QuestionDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.select_related('quiz__course').prefetch_related('choices')
    permission_classes = [AssessmentAccessPermission]

    def get_serializer_class(self):
        if self.request.method in {'PATCH', 'PUT', 'DELETE'}:
            return QuestionWriteSerializer
        if user_can_manage_course(self.request.user, self.get_object().quiz.course):
            return InstructorQuestionSerializer
        return StudentQuestionSerializer


class QuestionChoiceListCreateV1(generics.ListCreateAPIView):
    permission_classes = [AssessmentAccessPermission]
    pagination_class = AssessmentPagination

    def get_question(self):
        return get_object_or_404(
            Question.objects.select_related('quiz__course'),
            pk=self.kwargs['question_pk'],
        )

    def get_queryset(self):
        question = self.get_question()
        if not user_can_manage_course(self.request.user, question.quiz.course) and not user_is_enrolled(
            self.request.user, question.quiz.course
        ):
            raise PermissionDenied('Only enrolled students can access this quiz.')
        return Choice.objects.filter(question=question).order_by('order', 'pk')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['question'] = self.get_question()
        return context

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChoiceWriteSerializer
        if user_can_manage_course(self.request.user, self.get_question().quiz.course):
            return InstructorChoiceSerializer
        return StudentChoiceSerializer

    def perform_create(self, serializer):
        question = self.get_question()
        if not user_can_manage_course(self.request.user, question.quiz.course):
            raise PermissionDenied('Only the course owner or an admin can manage answer choices.')
        serializer.save(question=question)


class ChoiceDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Choice.objects.select_related('question__quiz__course')
    permission_classes = [AssessmentAccessPermission]

    def get_serializer_class(self):
        if self.request.method in {'PATCH', 'PUT', 'DELETE'}:
            return ChoiceWriteSerializer
        if user_can_manage_course(self.request.user, self.get_object().question.quiz.course):
            return InstructorChoiceSerializer
        return StudentChoiceSerializer


class QuizAttemptsV1(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AssessmentPagination

    def get_quiz(self):
        return get_object_or_404(Quiz.objects.select_related('course'), pk=self.kwargs['quiz_pk'])

    def get(self, request, quiz_pk):
        quiz = self.get_quiz()
        is_manager = user_can_manage_course(request.user, quiz.course)
        if not is_manager and not user_is_enrolled(request.user, quiz.course):
            raise PermissionDenied('Only enrolled students can view quiz results.')
        attempts = QuizAttempt.objects.filter(quiz=quiz).select_related('quiz', 'student')
        if not is_manager:
            attempts = attempts.filter(student=request.user)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(attempts, request, view=self)
        return paginator.get_paginated_response(QuizAttemptResultSerializer(page, many=True).data)

    def post(self, request, quiz_pk):
        with transaction.atomic():
            enrollment = get_object_or_404(
                Enrollment.objects.select_for_update().select_related('course'),
                student=request.user,
                course__quizzes__pk=quiz_pk,
            )
            quiz = get_object_or_404(
                Quiz.objects.select_related('course').prefetch_related('questions__choices'),
                pk=quiz_pk,
                course_id=enrollment.course_id,
            )
            previous_attempts = QuizAttempt.objects.filter(quiz=quiz, student=request.user).count()
            if previous_attempts >= quiz.max_attempts:
                raise ValidationError({'detail': 'The maximum number of quiz attempts has been reached.'})

            questions = list(quiz.questions.all())
            if not questions or any(
                not question.choices.exists()
                or not question.choices.filter(is_correct=True).exists()
                for question in questions
            ):
                raise ValidationError({'detail': 'This quiz is not ready to be submitted.'})

            serializer = QuizAttemptSubmitSerializer(
                data=request.data,
                context={'quiz': quiz},
            )
            serializer.is_valid(raise_exception=True)
            submitted_answers = serializer.validated_data['answers']
            answers_by_question = {
                answer['question'].pk: answer['choices']
                for answer in submitted_answers
            }
            score = Decimal('0.00')
            total_points = Decimal('0.00')
            stored_answers = []

            for question in questions:
                total_points += question.points
                selected = answers_by_question.get(question.pk, [])
                correct_ids = set(
                    question.choices.filter(is_correct=True).values_list('pk', flat=True)
                )
                selected_ids = {choice.pk for choice in selected}
                if selected_ids == correct_ids:
                    score += question.points
                stored_answers.append({
                    'question': question.pk,
                    'choices': sorted(selected_ids),
                })

            try:
                attempt = QuizAttempt.objects.create(
                    quiz=quiz,
                    student=request.user,
                    attempt_number=previous_attempts + 1,
                    answers=stored_answers,
                    score=score,
                    total_points=total_points,
                )
            except IntegrityError as exc:
                raise ValidationError({'detail': 'The maximum number of quiz attempts has been reached.'}) from exc

        return Response(
            QuizAttemptResultSerializer(attempt).data,
            status=status.HTTP_201_CREATED,
        )


class QuizAttemptDetailV1(generics.RetrieveAPIView):
    serializer_class = QuizAttemptResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        attempts = QuizAttempt.objects.select_related('quiz__course', 'student')
        if self.request.user.is_staff:
            return attempts
        return attempts.filter(
            Q(student=self.request.user)
            | Q(quiz__course__instructor=self.request.user)
        )


class AssignmentListCreateV1(generics.ListCreateAPIView):
    serializer_class = AssignmentWriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AssessmentPagination

    def get_course(self):
        return get_object_or_404(Course, slug=self.kwargs['course_slug'])

    def get_queryset(self):
        course = self.get_course()
        if not user_can_manage_course(self.request.user, course) and not user_is_enrolled(
            self.request.user, course
        ):
            raise PermissionDenied('Only enrolled students can access course assignments.')
        return Assignment.objects.filter(course=course)

    def perform_create(self, serializer):
        course = self.get_course()
        if not user_can_manage_course(self.request.user, course):
            raise PermissionDenied('Only the course owner or an admin can manage assignments.')
        serializer.save(course=course)


class AssignmentDetailV1(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.select_related('course')
    serializer_class = AssignmentWriteSerializer
    permission_classes = [AssessmentAccessPermission]


class AssignmentSubmissionListCreateV1(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AssessmentPagination

    def get_assignment(self):
        return get_object_or_404(
            Assignment.objects.select_related('course'),
            pk=self.kwargs['assignment_pk'],
        )

    def get_queryset(self):
        assignment = self.get_assignment()
        is_manager = user_can_manage_course(self.request.user, assignment.course)
        if not is_manager and not user_is_enrolled(self.request.user, assignment.course):
            raise PermissionDenied('Only enrolled students can access assignment submissions.')
        submissions = AssignmentSubmission.objects.filter(assignment=assignment).select_related(
            'student', 'assignment__course', 'graded_by'
        )
        if not is_manager:
            submissions = submissions.filter(student=self.request.user)
        return submissions

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssignmentSubmissionCreateSerializer
        return AssignmentSubmissionResultSerializer

    def create(self, request, *args, **kwargs):
        assignment = self.get_assignment()
        if not user_is_enrolled(request.user, assignment.course):
            raise PermissionDenied('Only enrolled students can submit this assignment.')
        if assignment.due_at and timezone.now() > assignment.due_at:
            raise ValidationError({'detail': 'The assignment deadline has passed.'})
        if AssignmentSubmission.objects.filter(assignment=assignment, student=request.user).exists():
            raise ValidationError({'detail': 'Only one submission is allowed for this assignment.'})

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                submission = serializer.save(assignment=assignment, student=request.user)
        except IntegrityError as exc:
            raise ValidationError({'detail': 'Only one submission is allowed for this assignment.'}) from exc
        return Response(
            AssignmentSubmissionResultSerializer(submission).data,
            status=status.HTTP_201_CREATED,
        )


class AssignmentSubmissionDetailV1(generics.RetrieveUpdateAPIView):
    queryset = AssignmentSubmission.objects.select_related(
        'assignment__course', 'student', 'graded_by'
    )
    permission_classes = [SubmissionAccessPermission]

    def get_serializer_class(self):
        if self.request.method in {'PATCH', 'PUT'}:
            return AssignmentGradeSerializer
        return AssignmentSubmissionResultSerializer

    def perform_update(self, serializer):
        serializer.save(
            graded_by=self.request.user,
            graded_at=timezone.now(),
        )
