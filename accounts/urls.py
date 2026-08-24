from django.urls import path
from .views import LoginView, CurrentUserView, LogoutView, BranchListView, DeveloperListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('branches/', BranchListView.as_view(), name='branch_list'),
    path('developers/', DeveloperListView.as_view(), name='developer_list'),
]
