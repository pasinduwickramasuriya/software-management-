from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovedProjectViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'', ApprovedProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
