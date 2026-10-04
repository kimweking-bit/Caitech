from django.contrib import admin

from .models import BlogCategory, ContactInquiry, NewsletterSubscription, Post, Tag


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'published_at')
    list_filter = ('status', 'categories', 'tags')
    search_fields = ('title', 'excerpt', 'body')
    prepopulated_fields = {'slug': ('title',)}


admin.site.register(BlogCategory)
admin.site.register(Tag)
admin.site.register(NewsletterSubscription)
admin.site.register(ContactInquiry)
