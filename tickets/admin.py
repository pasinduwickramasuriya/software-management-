from django.contrib import admin
from .models import Ticket, TicketDocument, TicketApproval


class TicketDocumentInline(admin.TabularInline):
    model = TicketDocument
    extra = 0


class TicketApprovalInline(admin.TabularInline):
    model = TicketApproval
    extra = 0
    readonly_fields = ('decision_at',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'project_name', 'branch', 'created_by', 'status', 'created_at', 'sent_at')
    list_filter = ('status', 'branch', 'created_at')
    search_fields = ('project_name', 'requirements', 'created_by__username')
    inlines = [TicketDocumentInline, TicketApprovalInline]


@admin.register(TicketDocument)
class TicketDocumentAdmin(admin.ModelAdmin):
    list_display = ('document_id', 'ticket', 'file_name', 'file_type', 'file_size', 'uploaded_at')
    readonly_fields = ('uploaded_at', 'file_size', 'file_type')


@admin.register(TicketApproval)
class TicketApprovalAdmin(admin.ModelAdmin):
    list_display = ('decision_id', 'ticket', 'reviewer', 'decision', 'decision_as', 'decision_at')
    list_filter = ('decision', 'decision_as', 'decision_at')
