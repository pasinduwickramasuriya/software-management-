from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Branch, UserType


class Command(BaseCommand):
    help = "Seeds organizational branches (ICT, Food, Finance, etc.) and test users"

    def handle(self, *args, **options):
        User = get_user_model()

        self.stdout.write("1. Seeding Organizational Branches...")
        branch_names = [
            "Food Branch",
            "Finance Branch",
            "Human Resources Branch",
            "Marketing Branch",
            "ICT Branch",
        ]

        branches = {}
        for name in branch_names:
            branch, created = Branch.objects.get_or_create(branch_name=name)
            branches[name] = branch
            if created:
                self.stdout.write(self.style.SUCCESS(f"  + Created Branch: {name}"))
            else:
                self.stdout.write(f"  = Branch exists: {name}")

        self.stdout.write("\n2. Fetching Roles...")
        roles = {role.user_type: role for role in UserType.objects.all()}

        self.stdout.write("\n3. Creating Demo Users (Password: password123)...")
        demo_users = [
            # System Administrator
            {
                "username": "admin_user",
                "email": "admin@sms.local",
                "role": "Admin",
                "branch": None,
                "is_staff": True,
                "is_superuser": True,
            },
            # Food Branch Users
            {
                "username": "bm_food",
                "email": "bm_food@sms.local",
                "role": "Branch Manager",
                "branch": "Food Branch",
            },
            {
                "username": "eo_food",
                "email": "eo_food@sms.local",
                "role": "Executive Officer",
                "branch": "Food Branch",
            },
            # Finance Branch Users
            {
                "username": "bm_finance",
                "email": "bm_finance@sms.local",
                "role": "Branch Manager",
                "branch": "Finance Branch",
            },
            {
                "username": "eo_finance",
                "email": "eo_finance@sms.local",
                "role": "Executive Officer",
                "branch": "Finance Branch",
            },
            # IT / Technical Team
            {
                "username": "it_director",
                "email": "it_director@sms.local",
                "role": "IT Director",
                "branch": "ICT Branch",
            },
            {
                "username": "it_main_dev",
                "email": "it_main_dev@sms.local",
                "role": "IT Main Developer",
                "branch": "ICT Branch",
            },
            {
                "username": "dev_alice",
                "email": "alice@sms.local",
                "role": "Developer",
                "branch": "ICT Branch",
            },
            {
                "username": "dev_bob",
                "email": "bob@sms.local",
                "role": "Developer",
                "branch": "ICT Branch",
            },
        ]

        for u in demo_users:
            user = User.objects.filter(username=u["username"]).first()
            if not user:
                user = User.objects.create_user(
                    username=u["username"],
                    email=u["email"],
                    password="password123",
                    type=roles.get(u["role"]),
                    branch=branches.get(u["branch"]) if u["branch"] else None,
                    is_staff=u.get("is_staff", False),
                    is_superuser=u.get("is_superuser", False),
                )
                self.stdout.write(self.style.SUCCESS(f"  + Created {user.username} ({u['role']} - {u['branch']})"))
            else:
                user.type = roles.get(u["role"])
                user.branch = branches.get(u["branch"]) if u["branch"] else None
                user.set_password("password123")
                user.save()
                self.stdout.write(f"  = Updated {user.username} ({u['role']} - {u['branch']})")

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Seeding complete! All accounts ready."))
