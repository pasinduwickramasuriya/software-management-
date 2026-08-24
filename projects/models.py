from django.db import models
from django.conf import settings
from tickets.models import Ticket


class ProjectStatus(models.TextChoices):
    NOT_STARTED = 'Not Started', 'Not Started'
    IN_PROGRESS = 'In Progress', 'In Progress'
    COMPLETED = 'Completed', 'Completed'


class TaskStatus(models.TextChoices):
    NOT_STARTED = 'Not Started', 'Not Started'
    IN_PROGRESS = 'In Progress', 'In Progress'
    COMPLETED = 'Completed', 'Completed'


class ApprovedProject(models.Model):
    project_id = models.AutoField(primary_key=True)
    ticket = models.OneToOneField(
        Ticket, on_delete=models.CASCADE, related_name='approved_project'
    )
    project_name = models.CharField(max_length=150)
    status = models.CharField(
        max_length=30,
        choices=ProjectStatus.choices,
        default=ProjectStatus.NOT_STARTED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Project #{self.project_id}: {self.project_name} ({self.status})"


class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='tasks'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='assigned_tasks'
    )
    task_title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=30,
        choices=TaskStatus.choices,
        default=TaskStatus.NOT_STARTED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Task #{self.task_id}: {self.task_title} ({self.status})"
