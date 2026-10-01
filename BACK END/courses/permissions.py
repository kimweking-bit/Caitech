from rest_framework.permissions import BasePermission


class IsVerifiedInstructor(BasePermission):
    message = "Only verified instructors can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'is_verified_instructor', False)
        )
