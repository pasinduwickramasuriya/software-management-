from django.urls import path, include

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('tickets/', include('tickets.urls')),
    path('projects/', include('projects.urls')),
]
