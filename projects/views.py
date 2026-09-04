from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ApprovedProject, Task
from .serializers import ApprovedProjectSerializer, TaskSerializer

from tickets.emails import send_task_assigned_to_developer



class ApprovedProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovedProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ApprovedProject.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='mark-completed')
    def mark_completed(self, request, pk=None):
        """IT Main Developer marks project complete once all tasks are done."""
        project = self.get_object()
        user = request.user
        role = user.type.user_type if user.type else None

        if role not in ['IT Main Developer', 'IT Director'] and not user.is_superuser:
            return Response(
                {'detail': 'Only IT Main Developer or Director can complete projects.'},
                status=status.HTTP_403_FORBIDDEN
            )

        project.status = 'Completed'
        project.save()

        # Update the original ticket status to Completed
        ticket = project.ticket
        ticket.status = 'completed'
        ticket.save()

        return Response(ApprovedProjectSerializer(project).data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = user.type.user_type if user.type else None

        # Developers see tasks assigned to them
        if role == 'Developer' and not user.is_superuser:
            return Task.objects.filter(assigned_to=user)

        # Admin, IT Main Dev, IT Director see all tasks
        return Task.objects.all()

    # def perform_create(self, serializer):
    #     task = serializer.save()
    #     # Automatically update project status to 'In Progress' if tasks exist
    #     project = getattr(task.ticket, 'approved_project', None)
    #     if project and project.status == 'Not Started':
    #         project.status = 'In Progress'
    #         project.save()

    def perform_create(self, serializer):
        task = serializer.save()
        # Automatically update project status to 'In Progress' if tasks exist
        project = getattr(task.ticket, 'approved_project', None)
        if project and project.status == 'Not Started':
            project.status = 'In Progress'
            project.save()

        # Send email notification to the assigned developer
        send_task_assigned_to_developer(task)
        

    def perform_update(self, serializer):
        old_assigned_to = self.get_object().assigned_to
        task = serializer.save()
        # If developer changed during edit, send an email to the newly assigned developer
        if old_assigned_to != task.assigned_to:
            send_task_assigned_to_developer(task)



    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Allows a developer to update only the status of their assigned task."""
        task = self.get_object()
        user = request.user

        if task.assigned_to != user and not user.is_superuser:
            return Response(
                {'detail': 'You can only update status for tasks assigned to you.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        if new_status not in ['Not Started', 'In Progress', 'Completed']:
            return Response(
                {'detail': 'Invalid status choice.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = new_status
        task.save()

        return Response(TaskSerializer(task).data)
