from decimal import Decimal

from rest_framework import serializers

from .models import (
    Assignment,
    AssignmentSubmission,
    Choice,
    Question,
    Quiz,
    QuizAttempt,
)


class QuizWriteSerializer(serializers.ModelSerializer):
    max_attempts = serializers.IntegerField(min_value=1, max_value=100)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'max_attempts', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']


class InstructorChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']


class StudentQuestionSerializer(serializers.ModelSerializer):
    choices = StudentChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'prompt', 'order', 'points', 'allow_multiple', 'choices']


class InstructorQuestionSerializer(serializers.ModelSerializer):
    choices = InstructorChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'prompt', 'order', 'points', 'allow_multiple', 'choices']


class StudentQuizSerializer(serializers.ModelSerializer):
    questions = StudentQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'max_attempts', 'questions']


class InstructorQuizSerializer(serializers.ModelSerializer):
    questions = InstructorQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'max_attempts', 'questions']


class QuestionWriteSerializer(serializers.ModelSerializer):
    points = serializers.DecimalField(max_digits=7, decimal_places=2, min_value=Decimal('0.01'))

    class Meta:
        model = Question
        fields = ['id', 'prompt', 'order', 'points', 'allow_multiple']
        read_only_fields = ['id']

    def validate_order(self, value):
        quiz = getattr(self.instance, 'quiz', None) or self.context.get('quiz')
        questions = Question.objects.filter(quiz=quiz, order=value) if quiz else Question.objects.none()
        if self.instance:
            questions = questions.exclude(pk=self.instance.pk)
        if questions.exists():
            raise serializers.ValidationError('Question order must be unique within a quiz.')
        return value


class ChoiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']
        read_only_fields = ['id']

    def validate_order(self, value):
        question = getattr(self.instance, 'question', None) or self.context.get('question')
        choices = Choice.objects.filter(question=question, order=value) if question else Choice.objects.none()
        if self.instance:
            choices = choices.exclude(pk=self.instance.pk)
        if choices.exists():
            raise serializers.ValidationError('Choice order must be unique within a question.')
        return value


class QuizAnswerInputSerializer(serializers.Serializer):
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())
    choices = serializers.PrimaryKeyRelatedField(
        queryset=Choice.objects.all(), many=True, allow_empty=True
    )

    def validate(self, attrs):
        question = attrs['question']
        choices = attrs['choices']
        if question.quiz_id != self.context['quiz'].pk:
            raise serializers.ValidationError('Question does not belong to this quiz.')
        if any(choice.question_id != question.pk for choice in choices):
            raise serializers.ValidationError('Each selected choice must belong to its question.')
        if len({choice.pk for choice in choices}) != len(choices):
            raise serializers.ValidationError('A choice may only be selected once.')
        if not question.allow_multiple and len(choices) > 1:
            raise serializers.ValidationError('This question accepts only one choice.')
        return attrs


class QuizAttemptSubmitSerializer(serializers.Serializer):
    answers = QuizAnswerInputSerializer(many=True, allow_empty=True)

    def validate_answers(self, answers):
        question_ids = [answer['question'].pk for answer in answers]
        if len(set(question_ids)) != len(question_ids):
            raise serializers.ValidationError('Submit at most one answer per question.')
        return answers


class QuizAttemptResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'attempt_number', 'score', 'total_points',
            'started_at', 'submitted_at',
        ]
        read_only_fields = fields


class AssignmentWriteSerializer(serializers.ModelSerializer):
    max_points = serializers.DecimalField(max_digits=7, decimal_places=2, min_value=Decimal('0.01'))

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_at', 'max_points', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'content', 'submitted_at']
        read_only_fields = ['id', 'submitted_at']


class AssignmentSubmissionResultSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'student', 'student_username', 'content', 'submitted_at',
            'grade', 'feedback', 'graded_by', 'graded_at',
        ]
        read_only_fields = fields


class AssignmentGradeSerializer(serializers.ModelSerializer):
    grade = serializers.DecimalField(max_digits=7, decimal_places=2, min_value=0)

    class Meta:
        model = AssignmentSubmission
        fields = ['grade', 'feedback']

    def validate_grade(self, value):
        if value > self.instance.assignment.max_points:
            raise serializers.ValidationError('Grade cannot exceed the assignment maximum points.')
        return value

    def validate_grade(self, value):
        if value > self.instance.assignment.max_points:
            raise serializers.ValidationError('Grade cannot exceed the assignment maximum points.')
        return value
