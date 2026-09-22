from django.shortcuts import render, redirect, get_object_or_404, Http404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_POST
from django.db.models import Q

from .models import Post, Comment, Like
from .forms import PostForm, CommentForm
from users.models import Follow


@login_required
def feed_view(request):
    feed_posts = Post.objects.select_related("author__profile").prefetch_related("comments__user__profile", "likes").order_by("-created_at")
    liked_post_ids = set(Like.objects.filter(user=request.user, post__in=feed_posts).values_list("post_id", flat=True))
    return render(request, "posts/feed.html", {
        "posts": feed_posts,
        "liked_post_ids": liked_post_ids,
        "comment_form": CommentForm(),
    })


@login_required
def create_post_view(request):
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = Post.objects.create(
                author=request.user,
                content=form.cleaned_data["content"],
                image=form.cleaned_data.get("image"),
            )
            messages.success(request, "Post created successfully.")
            return redirect("post_detail", post_id=post.id)
    else:
        form = PostForm()
    return render(request, "posts/create_post.html", {"form": form})


@login_required
def post_detail_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = post.comments.select_related("user__profile").order_by("created_at")
    is_liked = Like.objects.filter(user=request.user, post=post).exists()
    return render(request, "posts/post_detail.html", {
        "post": post,
        "comments": comments,
        "is_liked": is_liked,
        "comment_form": CommentForm(),
    })


@login_required
def edit_post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if post.author != request.user:
        return HttpResponseForbidden("You are not allowed to edit this post.")
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post.content = form.cleaned_data["content"]
            if form.cleaned_data.get("image"):
                post.image = form.cleaned_data["image"]
            if request.POST.get("remove_image") == "on" and post.image:
                post.image = None
            post.save()
            messages.success(request, "Post updated successfully.")
            return redirect("post_detail", post_id=post.id)
    else:
        form = PostForm(initial={"content": post.content, "image": post.image})
    return render(request, "posts/edit_post.html", {"form": form, "post": post})


@login_required
def delete_post_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if post.author != request.user:
        return HttpResponseForbidden("You are not allowed to delete this post.")
    if request.method == "POST":
        post.delete()
        messages.success(request, "Post deleted.")
        return redirect("feed")
    return render(request, "posts/delete_post.html", {"post": post})


@login_required
@require_POST
def api_like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    existing = Like.objects.filter(user=request.user, post=post)
    if existing.exists():
        existing.delete()
        liked = False
    else:
        Like.objects.create(user=request.user, post=post)
        liked = True
    return JsonResponse({
        "liked": liked,
        "like_count": post.like_count,
    })


@login_required
@require_POST
def api_add_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    text = request.POST.get("text", "").strip()
    if not text:
        return JsonResponse({"error": "Comment cannot be empty."}, status=400)
    comment = Comment.objects.create(post=post, user=request.user, text=text)
    return JsonResponse({
        "id": comment.id,
        "text": comment.text,
        "username": comment.user.username,
        "profile_picture": comment.user.profile.profile_picture.url if hasattr(comment.user, "profile") else "",
        "created_at": comment.created_at.strftime("%b %d, %Y %H:%M"),
        "can_delete": True,
    })


@login_required
@require_POST
def api_delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    if comment.user != request.user:
        return JsonResponse({"error": "You can only delete your own comments."}, status=403)
    comment.delete()
    return JsonResponse({"deleted": True})
