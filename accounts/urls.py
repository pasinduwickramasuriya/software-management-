from django.urls import path
from .views import (
    LoginView,
    CurrentUserView,
    LogoutView,
    BranchListView,
    DeveloperListView,
    UserTypeListView,
    UserManagementView,
    UserDetailView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('branches/', BranchListView.as_view(), name='branch_list'),
    path('developers/', DeveloperListView.as_view(), name='developer_list'),
    path('roles/', UserTypeListView.as_view(), name='role_list'),
    path('users/', UserManagementView.as_view(), name='user_management'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
