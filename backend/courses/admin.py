from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Category,
    Course,
    CourseReview,
    Enrollment,
    Lesson,
    LessonProgress,
    Section,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "display_order", "is_official")
    list_filter = ("is_official",)
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("display_order", "name", "pk")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "image_preview",
        "title",
        "category",
        "instructor",
        "source_id",
        "is_official",
        "price",
        "original_price",
        "currency",
        "seat_capacity",
        "is_published",
    )
    list_filter = (
        "is_published",
        "is_official",
        "currency",
        "level",
        "course_type",
        "intake_status",
        "category",
    )
    search_fields = (
        "title",
        "slug",
        "description",
        "source_id",
        "instructor__username",
    )
    prepopulated_fields = {"slug": ("title",)}
    list_select_related = ("category", "instructor")
    readonly_fields = ("source_id", "image_preview")

    @admin.display(description="Cover")
    def image_preview(self, obj: Course) -> str:
        if not obj.image:
            return "—"
        try:
            url = obj.image.url
        except Exception:
            return "—"
        return format_html(
            '<img src="{}" alt="" '
            'style="height:40px;width:64px;object-fit:cover;border-radius:4px;" />',
            url,
        )


admin.site.register(Section)
admin.site.register(Lesson)
admin.site.register(CourseReview)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
