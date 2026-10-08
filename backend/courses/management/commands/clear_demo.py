"""Manually remove CAITECH demo dataset. Never run automatically."""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Category, Course
from site_content.models import BlogPost

User = get_user_model()
DEMO_TAG = "[DEMO]"
DEMO_USERNAMES = ("demo.student", "demo.instructor", "demo.admin")


class Command(BaseCommand):
    help = "Delete DEMO-tagged courses/users/posts. Manual maintenance only."

    def add_arguments(self, parser):
        parser.add_argument("--yes", action="store_true", help="Confirm deletion.")

    @transaction.atomic
    def handle(self, *args, **options):
        if not options["yes"]:
            self.stderr.write("Refusing to run without --yes. Demo data is kept by default.")
            return
        courses = Course.objects.filter(slug__startswith="demo-")
        n_c = courses.count()
        courses.delete()
        cats = Category.objects.filter(name__startswith=DEMO_TAG)
        n_cat = cats.count()
        cats.delete()
        posts = BlogPost.objects.filter(slug__startswith="demo-")
        n_p = posts.count()
        posts.delete()
        users = User.objects.filter(username__in=DEMO_USERNAMES)
        n_u = users.count()
        users.delete()
        self.stdout.write(self.style.WARNING(f"Removed demo courses={n_c} categories={n_cat} posts={n_p} users={n_u}"))
