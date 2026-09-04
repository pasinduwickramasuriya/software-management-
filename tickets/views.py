from django.utils import timezone
from .emails import send_ticket_approved_to_it_main
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Ticket, TicketDocument, TicketApproval
from .serializers import (
    TicketSerializer,
    TicketDocumentSerializer,
    TicketApprovalSerializer,
    DecisionInputSerializer,
)
from projects.models import ApprovedProject
from rest_framework.parsers import MultiPartParser, FormParser


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = user.type.user_type if user.type else None

        # Superuser and Admin see all tickets
        if user.is_superuser or role == 'Admin':
            return Ticket.objects.all().order_by('-created_at')

        # IT Director sees ONLY tickets that have been approved by the Executive Officer
        if role == 'IT Director':
            return Ticket.objects.filter(
                status__in=['pending_director', 'approved', 'rejected_by_director', 'completed']
            ).order_by('-created_at')

        # IT Main Developer sees approved and completed development tickets
        if role == 'IT Main Developer':
            return Ticket.objects.filter(
                status__in=['approved', 'completed']
            ).order_by('-created_at')

        # Branch Manager & Executive Officer only see tickets for their own branch
        if role in ['Branch Manager', 'Executive Officer', 'Branch Executive Officer'] and user.branch:
            return Ticket.objects.filter(branch=user.branch).order_by('-created_at')

        # Developers see approved tickets
        return Ticket.objects.filter(status='approved').order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch
        
        if not branch and not user.is_superuser:
            raise ValidationError({'branch': 'Your user account is not assigned to any branch.'})
            
        serializer.save(
            created_by=user,
            branch=branch,
            status='draft'
        )


    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        user = request.user
        role = user.type.user_type if user.type else None

        # Only editable in Draft/Rejected by BM, or in Pending Executive by EO
        is_bm_editable = (
            role == 'Branch Manager' and 
            ticket.created_by == user and 
            ticket.status in ['draft', 'rejected_by_executive', 'rejected_by_director']
        )
        is_eo_editable = (
            role in ['Executive Officer', 'Branch Executive Officer'] and 
            ticket.status in ['pending_executive', 'draft'] and 
            (not user.branch or ticket.branch == user.branch)
        )

        if not (is_bm_editable or is_eo_editable or user.is_superuser):
            return Response(
                {'detail': 'You cannot edit this ticket in its current status.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Branch Manager sends Draft or Rejected ticket for Executive review."""
        ticket = self.get_object()
        user = request.user

        if ticket.created_by != user and not user.is_superuser:
            return Response(
                {'detail': 'Only the creator can send this ticket.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status not in ['draft', 'rejected_by_executive', 'rejected_by_director']:
            return Response(
                {'detail': f'Cannot send ticket with status "{ticket.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = 'pending_executive'
        ticket.sent_at = timezone.now()
        ticket.save()

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Branch Manager closes a rejected or draft ticket."""
        ticket = self.get_object()
        user = request.user

        if ticket.created_by != user and not user.is_superuser:
            return Response(
                {'detail': 'Only the creator can close this ticket.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status not in ['rejected_by_executive', 'rejected_by_director', 'draft']:
            return Response(
                {'detail': f'Cannot close ticket with status "{ticket.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = 'closed'
        ticket.save()
        return Response(TicketSerializer(ticket).data)


    @action(detail=True, methods=['post'], url_path='upload-document',
            parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        """Uploads attachment and stores raw bytes directly into MySQL database and file_path."""
        ticket = self.get_object()
        user = request.user

        if ticket.created_by != user and not user.is_superuser:
            return Response(
                {'detail': 'Only the creator can attach documents to this ticket.'},
                status=status.HTTP_403_FORBIDDEN
            )

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Read the whole raw binary file content
        binary_content = uploaded_file.read()

        # Save the whole file directly ONLY into MySQL database (no file stored on disk)
        document = TicketDocument.objects.create(
            ticket=ticket,
            file_name=uploaded_file.name,
            file_type=uploaded_file.content_type or 'application/octet-stream',
            file_size=uploaded_file.size,
            file_data=binary_content,
        )

        return Response(TicketDocumentSerializer(document, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='documents/(?P<doc_id>[^/.]+)/download')
    def download_document(self, request, doc_id=None):
        """Downloads/views document directly from MySQL database binary data."""
        try:
            doc = TicketDocument.objects.get(document_id=doc_id)
            content_type = doc.file_type or 'application/octet-stream'
            if doc.file_data:
                response = HttpResponse(doc.file_data, content_type=content_type)
                response['Content-Disposition'] = f'inline; filename="{doc.file_name}"'
                return response
            return Response({'detail': 'No file content found in database.'}, status=status.HTTP_404_NOT_FOUND)
        except TicketDocument.DoesNotExist:
            return Response({'detail': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='executive-decision')
    def executive_decision(self, request, pk=None):
        """Executive Officer approves or rejects the ticket."""
        ticket = self.get_object()
        user = request.user
        role = user.type.user_type if user.type else None

        if role not in ['Executive Officer', 'Branch Executive Officer'] and not user.is_superuser:
            return Response(
                {'detail': 'Only Executive Officers can make this decision.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Enforce that Executive Officer can only review tickets of their own branch
        if user.branch and ticket.branch != user.branch and not user.is_superuser:
            return Response(
                {'detail': 'You can only review and approve tickets from your own branch.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status not in ['pending_executive', 'draft']:
            return Response(
                {'detail': 'Ticket is not pending executive review.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DecisionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data['decision']
        remark = serializer.validated_data['remark']

        # Record decision minute
        TicketApproval.objects.create(
            ticket=ticket,
            reviewer=user,
            decision=decision,
            decision_as='Executive Officer',
            remark=remark
        )

        # Update status
        if decision == 'approved':
            ticket.status = 'pending_director'
        else:
            ticket.status = 'rejected_by_executive'
        ticket.save()

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['post'], url_path='director-decision')
    def director_decision(self, request, pk=None):
        """IT Director authorizes or rejects the ticket proposal."""
        ticket = self.get_object()
        user = request.user
        role = user.type.user_type if user.type else None

        if role != 'IT Director' and not user.is_superuser:
            return Response(
                {'detail': 'Only the IT Director can make this decision.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != 'pending_director':
            return Response(
                {'detail': 'Ticket is not pending director review.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DecisionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data['decision']
        remark = serializer.validated_data['remark']

        # Record decision minute
        TicketApproval.objects.create(
            ticket=ticket,
            reviewer=user,
            decision=decision,
            decision_as='IT Director',
            remark=remark
        )

        # if decision == 'approved':
        #     ticket.status = 'approved'
        #     ticket.save()

        #     # Automatically create ApprovedProject for IT Main Developer
        #     ApprovedProject.objects.get_or_create(
        #         ticket=ticket,
        #         defaults={'project_name': ticket.project_name, 'status': 'Not Started'}
        #     )
        # else:
        #     ticket.status = 'rejected_by_director'
        #     ticket.save()

        if decision == 'approved':
            ticket.status = 'approved'
            ticket.save()

            # Automatically create ApprovedProject for IT Main Developer
            ApprovedProject.objects.get_or_create(
                ticket=ticket,
                defaults={'project_name': ticket.project_name, 'status': 'Not Started'}
            )

            # Send email notification to IT Main Developer
            send_ticket_approved_to_it_main(ticket)
        else:
            ticket.status = 'rejected_by_director'
            ticket.save()


        return Response(TicketSerializer(ticket).data)
