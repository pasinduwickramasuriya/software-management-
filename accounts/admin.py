from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import Branch, UserType, User


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("bid", "branch_name")


@admin.register(UserType)
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ("type_id", "user_type")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "type", "branch", "is_active")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role", {"fields": ("type", "branch")}),
    )