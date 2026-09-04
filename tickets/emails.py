import logging
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import User

logger = logging.getLogger(__name__)


def _get_base_template(badge_text, badge_color, badge_bg, header_gradient, title, subtitle, content_html, cta_text="Open Dashboard", cta_url="http://localhost:5173"):
    """
    Renders a modern, charming, and fully responsive HTML email template.
    Uses bulletproof inline CSS compatible with Gmail, Outlook, Apple Mail, and mobile clients.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: {header_gradient}; padding: 32px 32px 28px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- Pill Badge -->
                    <span style="display: inline-block; background-color: {badge_bg}; color: {badge_color}; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                      {badge_text}
                    </span>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3; letter-spacing: -0.02em;">
                      {title}
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.88); font-weight: 400; line-height: 1.4;">
                      {subtitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              {content_html}

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px; margin-bottom: 8px;">
                <tr>
                  <td align="center">
                    <a href="{cta_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); letter-spacing: 0.01em;">
                      {cta_text} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #f1f5f9;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.02em; text-transform: uppercase;">
                Software Management System &bull; IT Department
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                This is an automated operational alert. Please do not reply directly to this email.<br>
                To take action, please sign in to your dashboard portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_ticket_approved_to_it_main(ticket):
    """
    Sends a charming, professional email notification to all users with
    the 'IT Main Developer' role when an IT Director approves a ticket.
    """
    try:
        it_main_users = User.objects.filter(type__user_type='IT Main Developer')
        recipient_list = [user.email for user in it_main_users if user.email]

        if not recipient_list:
            logger.warning("No IT Main Developer with valid email found to notify.")
            return

        subject = f"✨ [Approved Project] #{ticket.ticket_id} - {ticket.project_name}"
        branch_name = ticket.branch.branch_name if ticket.branch else "Head Office / All Branches"
        created_by = ticket.created_by.username if ticket.created_by else "System"

        # Formatted requirements preview (clean multiline)
        req_lines = ticket.requirements.strip().replace('\n', '<br>')

        content_html = f"""
          <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Hello <strong>IT Main Team</strong>,
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            The <strong>IT Director</strong> has reviewed and officially authorized the following project proposal. 
            An <strong>Approved Project</strong> record has been automatically initiated and is now ready for task breakdown and developer assignment.
          </p>

          <!-- Key Details Card -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 18px 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; width: 34%; text-transform: uppercase; letter-spacing: 0.03em;">Ticket ID</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">#{ticket.ticket_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Project Name</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #2563eb;">{ticket.project_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Branch</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">{branch_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Initiated By</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">{created_by}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Status</td>
                    <td style="padding: 6px 0;">
                      <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px;">
                        Approved / Ready for Development
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Scope / Requirements Callout -->
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
              Project Scope & Requirements
            </div>
            <div style="font-size: 13px; line-height: 1.6; color: #1e3a8a;">
              {req_lines}
            </div>
          </div>
        """

        html_message = _get_base_template(
            badge_text="Executive Authorization",
            badge_color="#047857",
            badge_bg="#d1fae5",
            header_gradient="linear-gradient(135deg, #059669 0%, #0d9488 100%)",
            title=f"Project Approved: {ticket.project_name}",
            subtitle=f"Ticket #{ticket.ticket_id} is now authorized for development breakdown",
            content_html=content_html,
            cta_text="Assign Tasks & View Project",
        )

        plain_message = (
            f"Hello IT Main Team,\n\n"
            f"The IT Director has approved the following project proposal:\n\n"
            f"Ticket ID    : #{ticket.ticket_id}\n"
            f"Project Name : {ticket.project_name}\n"
            f"Branch       : {branch_name}\n"
            f"Created By   : {created_by}\n"
            f"Requirements :\n{ticket.requirements}\n\n"
            f"Please log in to your dashboard to break down tasks and assign developers.\n\n"
            f"Best regards,\nSoftware Management System"
        )

        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Error sending email to IT Main Developer: {e}")


def send_task_assigned_to_developer(task):
    """
    Sends a charming, professional email notification to the assigned Developer
    when IT Main Developer assigns a task to them.
    """
    try:
        developer = task.assigned_to
        if not developer or not developer.email:
            logger.warning(f"Developer {developer} does not have a registered email.")
            return

        subject = f"🎯 [Task Assigned] #{task.task_id}: {task.task_title}"
        project_name = task.ticket.project_name
        branch_name = task.ticket.branch.branch_name if task.ticket.branch else "Head Office / All Branches"
        dev_name = developer.first_name or developer.username

        desc_formatted = task.description.strip().replace('\n', '<br>') if task.description else "<em>No additional description provided. Check task specifications in the portal.</em>"

        content_html = f"""
          <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Hello <strong>{dev_name}</strong>,
          </p>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            You have been assigned a new work task for the <strong>{project_name}</strong> project by the IT Main Developer.
          </p>

          <!-- Task Overview Card -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 18px 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; width: 34%; text-transform: uppercase; letter-spacing: 0.03em;">Task ID</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">#{task.task_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Task Title</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #4338ca;">{task.task_title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Project</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">{project_name} ({branch_name})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">Initial Status</td>
                    <td style="padding: 6px 0;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px;">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Task Details Callout -->
          <div style="background-color: #faf5ff; border-left: 4px solid #8b5cf6; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;">
              Task Instructions & Notes
            </div>
            <div style="font-size: 13px; line-height: 1.6; color: #4c1d95;">
              {desc_formatted}
            </div>
          </div>
        """

        html_message = _get_base_template(
            badge_text="Development Assignment",
            badge_color="#4338ca",
            badge_bg="#e0e7ff",
            header_gradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            title=f"New Task: {task.task_title}",
            subtitle=f"Assigned for {project_name}",
            content_html=content_html,
            cta_text="Open Developer Dashboard",
        )

        plain_message = (
            f"Hello {dev_name},\n\n"
            f"You have been assigned a new task by the IT Main Developer:\n\n"
            f"Project     : {project_name} ({branch_name})\n"
            f"Task Title  : {task.task_title}\n"
            f"Task ID     : #{task.task_id}\n"
            f"Description :\n{task.description or 'No additional description provided.'}\n"
            f"Status      : {task.status}\n\n"
            f"Please log in to your Developer Dashboard to review the task and update your progress.\n\n"
            f"Best regards,\nIT Main Development Team"
        )

        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[developer.email],
            fail_silently=True,
        )
    except Exception as e:
        logger.error(f"Error sending task assignment email to developer: {e}")
