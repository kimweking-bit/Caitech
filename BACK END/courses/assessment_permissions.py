from rest_framework.permissions import SAFE_METHODS, BasePermission

from .permissions import user_can_manage_course


def assessment_course(obj):
    course = getattr(obj, 'course', None)
    if course is not None:
        return course
    quiz = getattr(obj, 'quiz', None)
    if quiz is not None:
        return quiz.course
    question = getattr(obj, 'question', None)
    if question is not None:
        return question.quiz.course
    assignment = getattr(obj, 'assignment', None)
    if assignment is not None:
        return assignment.course
    attempt = getattr(obj, 'attempt', None)
    if attempt is not None:
        return attempt.quiz.course
    return None


def user_is_enrolled(user, course):
    return bool(
        user
        and user.is_authenticated
        and course.enrollments.filter(student_id=user.pk).exists()
    )


class AssessmentAccessPermission(BasePermission):
    message = 'Only enrolled students or course instructors can access this assessment.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user.is_staff
            or getattr(request.user, 'is_verified_instructor', False)
        )

    def has_object_permission(self, request, view, obj):
        course = assessment_course(obj)
        if course is None:
            return False
        if request.method in SAFE_METHODS:
            return user_can_manage_course(request.user, course) or user_is_enrolled(
                request.user, course
            )
        return user_can_manage_course(request.user, course)


class SubmissionAccessPermission(BasePermission):
    message = 'Only the submitting student, course owner, or an admin can access this submission.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user.is_staff
            or getattr(request.user, 'is_verified_instructor', False)
        )

    def has_object_permission(self, request, view, submission):
        if request.method in SAFE_METHODS:
            return bool(
                submission.student_id == request.user.pk
                or user_can_manage_course(request.user, submission.assignment.course)
            )
        return user_can_manage_course(request.user, submission.assignment.course)
