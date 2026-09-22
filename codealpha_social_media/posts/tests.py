from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from posts.models import Post
from users.models import Follow


class FeedViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="pass123")
        self.other_user = User.objects.create_user(username="bob", password="pass123")

    def test_feed_shows_posts_from_other_users_when_no_follows_exist(self):
        Post.objects.create(author=self.other_user, content="Welcome to the timeline!")

        self.client.login(username="alice", password="pass123")
        response = self.client.get(reverse("feed"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Welcome to the timeline!")

    def test_feed_contains_posts_from_followed_users_and_self(self):
        Post.objects.create(author=self.other_user, content="A post from a friend")
        Follow.objects.create(follower=self.user, following=self.other_user)

        self.client.login(username="alice", password="pass123")
        response = self.client.get(reverse("feed"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "A post from a friend")
