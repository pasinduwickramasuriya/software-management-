from django.db import migrations

ROLES = [
    "Branch Manager",
    "Executive Officer",
    "IT Director",
    "IT Main Developer",
    "Developer",
    "Admin",
]


def seed_roles(apps, schema_editor):
    UserType = apps.get_model("accounts", "UserType")
    for role in ROLES:
        UserType.objects.get_or_create(user_type=role)


def unseed_roles(apps, schema_editor):
    UserType = apps.get_model("accounts", "UserType")
    UserType.objects.filter(user_type__in=ROLES).delete()


class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]
    operations = [migrations.RunPython(seed_roles, unseed_roles)]