from django.db import models
from accounts.models import Branch, User


class Ticket(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_executive", "Pending Executive Review"),
        ("rejected_by_executive", "Rejected by Executive"),
        ("pending_director", "Pending Director Review"),
        ("rejected_by_director", "Rejected by Director"),
        ("approved", "Approved / In Development"),
        ("completed", "Completed"),
    ]

    ticket_id = models.AutoField(primary_key=True)
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name="tickets")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tickets_created")
    project_name = models.CharField(max_length=150)
    requirements = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.project_name} ({self.status})"


class TicketDocument(models.Model):
    document_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="documents")
    file_name = models.CharField(max_length=150)
    file_path = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


class TicketApproval(models.Model):
    DECISION_CHOICES = [
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    DECISION_AS_CHOICES = [
        ("executive_officer", "Executive Officer"),
        ("it_director", "IT Director"),
    ]

    decision_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="approvals")
    reviewer = models.ForeignKey(User, on_delete=models.PROTECT, related_name="ticket_decisions")
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    decision_as = models.CharField(max_length=50, choices=DECISION_AS_CHOICES)
    remark = models.TextField()
    decision_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.decision} by {self.reviewer} ({self.decision_as})"