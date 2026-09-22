from django.contrib import admin
from .models import Post, Comment, Like


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "id", "created_at", "like_count", "comment_count")
    search_fields = ("author__username", "content")
    list_filter = ("created_at",)

    def like_count(self, obj):
        return obj.likes.count()

    def comment_count(self, obj):
        return obj.comments.count()


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "created_at")
    search_fields = ("user__username", "text")
    list_filter = ("created_at",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "post", "created_at")
    search_fields = ("user__username",)
    list_filter = ("created_at",)
