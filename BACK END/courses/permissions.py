from rest_framework.permissions import BasePermission


class IsVerifiedInstructor(BasePermission):
    message = "Only verified instructors can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'is_verified_instructor', False)
        )


class CanAccessLesson(BasePermission):
    message = "You must be enrolled in this course to access this lesson."

    def has_object_permission(self, request, view, lesson):
        if lesson.is_preview:
            return True

        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or lesson.course.instructor_id == user.pk
                or lesson.course.enrollments.filter(student_id=user.pk).exists()
            )
        )
