from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("search/", views.search_view, name="search"),
    path("api/search/", views.api_search, name="api_search"),
    path("profile/edit/", views.edit_profile_view, name="edit_profile"),
    path("profile/<str:username>/", views.profile_view, name="profile"),
    path("profile/<str:username>/followers/", views.followers_view, name="followers"),
    path("profile/<str:username>/following/", views.following_view, name="following"),
    path("api/follow/<str:username>/", views.api_follow, name="api_follow"),
]
