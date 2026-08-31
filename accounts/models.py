from django.contrib.auth.models import AbstractUser
from django.db import models


class Branch(models.Model):
    bid = models.AutoField(primary_key=True)
    branch_name = models.CharField(max_length=100)

    def __str__(self):
        return self.branch_name


class UserType(models.Model):
    type_id = models.AutoField(primary_key=True)
    user_type = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.user_type


class User(AbstractUser):
    """
    Extends Django's built-in user so username, password hashing,
    is_active/is_staff, and login are handled for free.
    """
    email = models.EmailField(unique=True)
    type = models.ForeignKey(
        UserType, on_delete=models.PROTECT, related_name="users",
        null=True, blank=True,
    )
    branch = models.ForeignKey(
        Branch, on_delete=models.PROTECT, related_name="users",
        null=True, blank=True,
        help_text="Null for IT-department roles not tied to one branch.",
    )

    def __str__(self):
        role = self.type.user_type if self.type else "No Role"
        return f"{self.username} ({role})"