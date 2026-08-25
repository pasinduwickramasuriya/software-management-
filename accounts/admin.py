from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import Branch, UserType, User


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("bid", "branch_name")
    search_fields = ("branch_name",)


@admin.register(UserType)
class UserTypeAdmin(admin.ModelAdmin):
    list_display = ("type_id", "user_type")
    search_fields = ("user_type",)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "type", "branch", "is_staff", "is_active")
    list_filter = ("type", "branch", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role & Organization", {"fields": ("type", "branch")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Role & Organization", {"fields": ("email", "type", "branch")}),
    )