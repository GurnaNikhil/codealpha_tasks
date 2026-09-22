from django.urls import path
from . import views

urlpatterns = [
    path("", views.feed_view, name="feed"),
    path("post/create/", views.create_post_view, name="create_post"),
    path("post/<int:post_id>/", views.post_detail_view, name="post_detail"),
    path("post/<int:post_id>/edit/", views.edit_post_view, name="edit_post"),
    path("post/<int:post_id>/delete/", views.delete_post_view, name="delete_post"),
    path("api/post/<int:post_id>/like/", views.api_like_post, name="api_like_post"),
    path("api/post/<int:post_id>/comment/", views.api_add_comment, name="api_add_comment"),
    path("api/comment/<int:comment_id>/delete/", views.api_delete_comment, name="api_delete_comment"),
]
