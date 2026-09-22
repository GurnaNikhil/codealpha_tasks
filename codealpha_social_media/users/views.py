from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.db.models import Q

from .models import Profile, Follow
from .forms import UserRegisterForm, ProfileEditForm
from posts.models import Post


def register_view(request):
    if request.user.is_authenticated:
        return redirect("/")
    if request.method == "POST":
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data["username"],
                email=form.cleaned_data["email"],
                password=form.cleaned_data["password"],
            )
            messages.success(request, "Account created successfully. You can now log in.")
            return redirect("login")
    else:
        form = UserRegisterForm()
    return render(request, "registration/register.html", {"form": form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("/")
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("/")
        messages.error(request, "Invalid username or password.")
    return render(request, "registration/login.html")


def logout_view(request):
    logout(request)
    return redirect("login")


@login_required
def search_view(request):
    return render(request, "users/search.html")


@login_required
def api_search(request):
    query = request.GET.get("q", "").strip()
    if len(query) < 1:
        return JsonResponse({"users": []})
    users = User.objects.filter(
        Q(username__icontains=query) | Q(profile__full_name__icontains=query)
    ).exclude(id=request.user.id)[:20]
    results = []
    for u in users:
        is_following = Follow.objects.filter(follower=request.user, following=u).exists()
        results.append({
            "id": u.id,
            "username": u.username,
            "full_name": u.profile.full_name if hasattr(u, "profile") else "",
            "profile_picture": u.profile.profile_picture.url if hasattr(u, "profile") else "",
            "is_following": is_following,
        })
    return JsonResponse({"users": results})


@login_required
def profile_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    user_posts = Post.objects.filter(author=profile_user).order_by("-created_at")
    is_following = False
    if request.user.is_authenticated and request.user != profile_user:
        is_following = Follow.objects.filter(follower=request.user, following=profile_user).exists()
    followers_count = Follow.objects.filter(following=profile_user).count()
    following_count = Follow.objects.filter(follower=profile_user).count()
    post_count = user_posts.count()
    context = {
        "profile_user": profile_user,
        "posts": user_posts,
        "is_following": is_following,
        "followers_count": followers_count,
        "following_count": following_count,
        "post_count": post_count,
    }
    return render(request, "users/profile.html", context)


@login_required
def edit_profile_view(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if request.method == "POST":
        form = ProfileEditForm(request.POST, request.FILES)
        if form.is_valid():
            profile.full_name = form.cleaned_data["full_name"]
            profile.bio = form.cleaned_data["bio"]
            if form.cleaned_data.get("profile_picture"):
                profile.profile_picture = form.cleaned_data["profile_picture"]
            profile.save()
            messages.success(request, "Profile updated successfully.")
            return redirect("profile", username=request.user.username)
    else:
        form = ProfileEditForm(initial={"full_name": profile.full_name, "bio": profile.bio})
    return render(request, "users/edit_profile.html", {"form": form, "profile": profile})


@login_required
def followers_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    follows = Follow.objects.filter(following=profile_user).select_related("follower__profile")
    return render(request, "users/follow_list.html", {
        "profile_user": profile_user,
        "follows": follows,
        "mode": "followers",
    })


@login_required
def following_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    follows = Follow.objects.filter(follower=profile_user).select_related("following__profile")
    return render(request, "users/follow_list.html", {
        "profile_user": profile_user,
        "follows": follows,
        "mode": "following",
    })


@login_required
@require_POST
def api_follow(request, username):
    target = get_object_or_404(User, username=username)
    if target == request.user:
        return JsonResponse({"error": "You cannot follow yourself."}, status=400)
    existing = Follow.objects.filter(follower=request.user, following=target)
    action = request.POST.get("action", "follow")
    if action == "follow":
        if not existing.exists():
            Follow.objects.create(follower=request.user, following=target)
            followed = True
        else:
            followed = True
    else:
        existing.delete()
        followed = False
    followers_count = Follow.objects.filter(following=target).count()
    return JsonResponse({"followed": followed, "followers_count": followers_count})
