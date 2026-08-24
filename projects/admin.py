from django.contrib import admin
from .models import ApprovedProject, Task


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0


@admin.register(ApprovedProject)
class ApprovedProjectAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'project_name', 'ticket', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('project_name', 'ticket__project_name')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'task_title', 'ticket', 'assigned_to', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'assigned_to', 'created_at')
    search_fields = ('task_title', 'description', 'ticket__project_name', 'assigned_to__username')
