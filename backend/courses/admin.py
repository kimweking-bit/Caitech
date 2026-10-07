from django.contrib import admin
from .models import Category, Course, CourseReview, Enrollment, Lesson, LessonProgress, Section


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
	list_display = ('title', 'category', 'instructor', 'price', 'original_price', 'currency', 'seat_capacity', 'is_published')
	list_filter = ('is_published', 'currency', 'level', 'course_type', 'intake_status', 'category')
	search_fields = ('title', 'slug', 'description', 'instructor__username')
	prepopulated_fields = {'slug': ('title',)}
	list_select_related = ('category', 'instructor')



admin.site.register(Category)
admin.site.register(Section)
admin.site.register(Lesson)
admin.site.register(CourseReview)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)

