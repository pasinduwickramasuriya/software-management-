from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import Branch, UserType
from tickets.models import Ticket, TicketApproval
from projects.models import ApprovedProject

User = get_user_model()


class TicketWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create roles
        self.role_bm, _ = UserType.objects.get_or_create(user_type='Branch Manager')
        self.role_eo, _ = UserType.objects.get_or_create(user_type='Executive Officer')
        self.role_director, _ = UserType.objects.get_or_create(user_type='IT Director')

        # Create branches
        self.branch_food = Branch.objects.create(branch_name='Food Branch')
        self.branch_finance = Branch.objects.create(branch_name='Finance Branch')
        self.branch_it = Branch.objects.create(branch_name='ICT Branch')

        # Create users
        self.bm_food = User.objects.create_user(
            username='bm_food',
            email='bm_food@test.local',
            password='password123',
            type=self.role_bm,
            branch=self.branch_food,
        )
        self.eo_food = User.objects.create_user(
            username='eo_food',
            email='eo_food@test.local',
            password='password123',
            type=self.role_eo,
            branch=self.branch_food,
        )
        self.eo_finance = User.objects.create_user(
            username='eo_finance',
            email='eo_finance@test.local',
            password='password123',
            type=self.role_eo,
            branch=self.branch_finance,
        )
        self.it_director = User.objects.create_user(
            username='it_director',
            email='it_director@test.local',
            password='password123',
            type=self.role_director,
            branch=self.branch_it,
        )

    def test_branch_executive_approval_and_it_director_flow(self):
        # 1. Branch Manager creates a ticket
        self.client.force_authenticate(user=self.bm_food)
        create_res = self.client.post('/api/tickets/', {
            'project_name': 'Food Inventory System',
            'requirements': 'Automate kitchen inventory and daily order tracking.',
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        ticket_id = create_res.data['ticket_id']
        ticket = Ticket.objects.get(ticket_id=ticket_id)
        self.assertEqual(ticket.status, 'draft')
        self.assertEqual(ticket.branch, self.branch_food)

        # 2. Branch Manager sends ticket to Executive
        send_res = self.client.post(f'/api/tickets/{ticket_id}/send/')
        self.assertEqual(send_res.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'pending_executive')

        # 3. Executive Officer from a DIFFERENT branch tries to approve -> 403 FORBIDDEN
        self.client.force_authenticate(user=self.eo_finance)
        diff_branch_res = self.client.post(f'/api/tickets/{ticket_id}/executive-decision/', {
            'decision': 'approved',
            'remark': 'Attempting approval from wrong branch',
        })
        # Since get_queryset filters tickets by branch, it either 404 or 403
        self.assertIn(diff_branch_res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

        # 4. Executive Officer from the SAME branch approves the ticket
        self.client.force_authenticate(user=self.eo_food)
        eo_res = self.client.post(f'/api/tickets/{ticket_id}/executive-decision/', {
            'decision': 'approved',
            'remark': 'Approved by Food Branch Executive. Forwarded to IT Director.',
        })
        self.assertEqual(eo_res.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        # Status MUST be pending_director (shared to IT director)
        self.assertEqual(ticket.status, 'pending_director')

        # Verify Approval record is saved
        approval = TicketApproval.objects.filter(ticket=ticket).first()
        self.assertIsNotNone(approval)
        self.assertEqual(approval.reviewer, self.eo_food)
        self.assertEqual(approval.decision, 'approved')
        self.assertEqual(approval.decision_as, 'Executive Officer')
        self.assertEqual(approval.remark, 'Approved by Food Branch Executive. Forwarded to IT Director.')

        # 5. IT Director sees the ticket in their queryset
        self.client.force_authenticate(user=self.it_director)
        dir_list_res = self.client.get('/api/tickets/')
        self.assertEqual(dir_list_res.status_code, status.HTTP_200_OK)
        ticket_ids = [t['ticket_id'] for t in dir_list_res.data]
        self.assertIn(ticket_id, ticket_ids)

        # 6. IT Director authorizes and approves the ticket
        dir_res = self.client.post(f'/api/tickets/{ticket_id}/director-decision/', {
            'decision': 'approved',
            'remark': 'Authorized by IT Director. Assigned for development.',
        })
        self.assertEqual(dir_res.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'approved')

        # Verify ApprovedProject was automatically created
        approved_project = ApprovedProject.objects.filter(ticket=ticket).first()
        self.assertIsNotNone(approved_project)
        self.assertEqual(approved_project.project_name, 'Food Inventory System')
        self.assertEqual(approved_project.status, 'Not Started')

    def test_executive_rejection_flow(self):
        # 1. Branch Manager creates and sends ticket
        self.client.force_authenticate(user=self.bm_food)
        create_res = self.client.post('/api/tickets/', {
            'project_name': 'Menu App',
            'requirements': 'Digital menu ordering.',
        })
        ticket_id = create_res.data['ticket_id']
        self.client.post(f'/api/tickets/{ticket_id}/send/')

        # 2. Executive Officer rejects the ticket
        self.client.force_authenticate(user=self.eo_food)
        reject_res = self.client.post(f'/api/tickets/{ticket_id}/executive-decision/', {
            'decision': 'rejected',
            'remark': 'Budget exceeded for this quarter. Please revise.',
        })
        self.assertEqual(reject_res.status_code, status.HTTP_200_OK)
        ticket = Ticket.objects.get(ticket_id=ticket_id)
        self.assertEqual(ticket.status, 'rejected_by_executive')

    def test_director_rejection_flow(self):
        # 1. Ticket approved by EO
        ticket = Ticket.objects.create(
            branch=self.branch_food,
            created_by=self.bm_food,
            project_name='CRM Portal',
            requirements='Manage customer inquiries.',
            status='pending_director',
        )

        # 2. IT Director rejects the ticket
        self.client.force_authenticate(user=self.it_director)
        reject_res = self.client.post(f'/api/tickets/{ticket.ticket_id}/director-decision/', {
            'decision': 'rejected',
            'remark': 'Requires integration with existing LDAP service before proceeding.',
        })
        self.assertEqual(reject_res.status_code, status.HTTP_200_OK)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'rejected_by_director')
