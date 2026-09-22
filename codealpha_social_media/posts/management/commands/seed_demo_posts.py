from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from posts.models import Post
from users.models import Profile


class Command(BaseCommand):
    help = "Create a few demo posts so the feed looks like a real social media timeline."

    def handle(self, *args, **options):
        demo_users = []
        for username, email in [
            ("maria", "maria@example.com"),
            ("alex", "alex@example.com"),
            ("noah", "noah@example.com"),
        ]:
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})
            if created:
                user.set_password("demo123")
                user.save()
            Profile.objects.get_or_create(user=user)
            demo_users.append(user)

        sample_posts = [
            (demo_users[0], "Morning coffee and a fresh start. What are you all working on today?"),
            (demo_users[1], "Weekend hike complete. The view was absolutely worth it."),
            (demo_users[2], "Just launched a new project and I am so excited to share more updates soon."),
        ]

        created_count = 0
        for author, content in sample_posts:
            post, created = Post.objects.get_or_create(author=author, content=content)
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created_count} demo posts for the feed."))
