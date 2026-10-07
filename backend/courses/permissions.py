from rest_framework.permissions import SAFE_METHODS, BasePermission


def user_can_manage_course(user, course):
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or (
                getattr(user, 'is_verified_instructor', False)
                and course.instructor_id == user.pk
            )
        )
    )


def user_can_access_course(user, course):
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or course.instructor_id == user.pk
            or course.enrollments.filter(student_id=user.pk).exists()
        )
    )


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
        return user_can_access_course(request.user, lesson.course)


class IsCourseOwnerOrStaffOrReadOnly(BasePermission):
    message = "Only the course owner or an admin can manage this content."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'is_verified_instructor', False))
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        course = getattr(obj, 'course', None)
        if course is None:
            lesson = getattr(obj, 'lesson', None)
            course = lesson.course if lesson else obj
        return user_can_manage_course(request.user, course)


class IsCourseManager(BasePermission):
    message = "Only verified instructors or admins can manage course content."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'is_verified_instructor', False))
        )

    def has_object_permission(self, request, view, obj):
        course = getattr(obj, 'course', None)
        if course is None:
            lesson = getattr(obj, 'lesson', None)
            course = lesson.course if lesson else obj
        return user_can_manage_course(request.user, course)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class CanAccessResource(BasePermission):
    message = "You must be enrolled in this course to access this resource."

    def has_object_permission(self, request, view, resource):
        return bool(
            resource.lesson.is_preview
            or user_can_access_course(request.user, resource.lesson.course)
        )


class CanReadLessonAndManageOwner(BasePermission):
    message = "You need course access to read this lesson; only its owner or an admin can change it."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'is_verified_instructor', False))
        )

    def has_object_permission(self, request, view, lesson):
        if request.method in SAFE_METHODS:
            return CanAccessLesson().has_object_permission(request, view, lesson)
        return user_can_manage_course(request.user, lesson.course)


class CanReadResourceAndManageOwner(BasePermission):
    message = "You need course access to read this resource; only its owner or an admin can change it."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'is_verified_instructor', False))
        )

    def has_object_permission(self, request, view, resource):
        if request.method in SAFE_METHODS:
            return CanAccessResource().has_object_permission(request, view, resource)
        return user_can_manage_course(request.user, resource.lesson.course)


class IsReviewOwnerOrAdmin(BasePermission):
    message = "Only the review author or an admin can change this review."

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(
            request.user and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, review):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or review.student_id == request.user.pk)
        )
