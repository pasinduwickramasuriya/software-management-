from rest_framework import serializers
from .models import ApprovedProject, Task
from tickets.serializers import TicketSerializer


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    ticket_name = serializers.CharField(source='ticket.project_name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'task_id',
            'ticket',
            'ticket_name',
            'assigned_to',
            'assigned_to_name',
            'task_title',
            'description',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['task_id', 'created_at', 'updated_at']


class ApprovedProjectSerializer(serializers.ModelSerializer):
    ticket_details = TicketSerializer(source='ticket', read_only=True)
    tasks = TaskSerializer(source='ticket.tasks', many=True, read_only=True)
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ApprovedProject
        fields = [
            'project_id',
            'ticket',
            'ticket_details',
            'project_name',
            'status',
            'created_at',
            'tasks',
            'total_tasks',
            'completed_tasks',
            'progress_percentage',
        ]
        read_only_fields = ['project_id', 'created_at']

    def get_total_tasks(self, obj):
        return obj.ticket.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.ticket.tasks.filter(status='Completed').count()

    def get_progress_percentage(self, obj):
        total = obj.ticket.tasks.count()
        if total == 0:
            return 0
        completed = obj.ticket.tasks.filter(status='Completed').count()
        return round((completed / total) * 100)
