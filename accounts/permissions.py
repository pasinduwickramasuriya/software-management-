from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.is_superuser or 
                (request.user.type and request.user.type.user_type == 'Admin')
            )
        )


class IsBranchManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.type and request.user.type.user_type == 'Branch Manager'
        )


class IsExecutiveOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.type and request.user.type.user_type == 'Executive Officer'
        )


class IsITDirector(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.type and request.user.type.user_type == 'IT Director'
        )


class IsITMainDeveloper(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.type and request.user.type.user_type == 'IT Main Developer'
        )


class IsDeveloper(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.type and request.user.type.user_type == 'Developer'
        )
