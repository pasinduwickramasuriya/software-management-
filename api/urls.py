from django.urls import path, include
from .views import get_hello

urlpatterns = [
    path('hello/', get_hello, name='get_hello'),
    path('auth/', include('accounts.urls')),
    path('tickets/', include('tickets.urls')),
    path('projects/', include('projects.urls')),
]
