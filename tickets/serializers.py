from rest_framework import serializers
from .models import Ticket, TicketDocument, TicketApproval
from accounts.serializers import UserSerializer, BranchSerializer


class TicketDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TicketDocument
        fields = ['document_id', 'ticket', 'file_name', 'file_type', 'file_size', 'file_url', 'uploaded_at']
        read_only_fields = ['document_id', 'ticket', 'file_type', 'file_size', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        download_path = f'/api/tickets/documents/{obj.document_id}/download/'
        return request.build_absolute_uri(download_path) if request else download_path



class TicketApprovalSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = TicketApproval
        fields = [
            'decision_id',
            'ticket',
            'reviewer',
            'reviewer_name',
            'decision',
            'decision_as',
            'remark',
            'decision_at',
        ]
        read_only_fields = ['decision_id', 'reviewer', 'decision_at']


class TicketSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)
    documents = TicketDocumentSerializer(many=True, required=False)
    approvals = TicketApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'ticket_id',
            'branch',
            'branch_name',
            'created_by',
            'created_by_name',
            'project_name',
            'requirements',
            'status',
            'created_at',
            'sent_at',
            'documents',
            'approvals',
        ]
        read_only_fields = ['ticket_id', 'branch', 'created_by', 'status', 'created_at', 'sent_at']

    def create(self, validated_data):
        documents_data = validated_data.pop('documents', [])
        ticket = Ticket.objects.create(**validated_data)
        for doc_data in documents_data:
            TicketDocument.objects.create(ticket=ticket, **doc_data)
        return ticket

    def update(self, instance, validated_data):
        documents_data = validated_data.pop('documents', None)
        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.requirements = validated_data.get('requirements', instance.requirements)
        instance.save()

        if documents_data is not None:
            for doc_data in documents_data:
                TicketDocument.objects.create(ticket=instance, **doc_data)
        return instance


class DecisionInputSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['approved', 'rejected'])
    remark = serializers.CharField(required=True, allow_blank=False)
