import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  Building2,
  FileText,
  Layers,
  UserPlus,
  PlusCircle,
  ExternalLink,
  Shield,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard({ setActivePage }) {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes, ticketsRes, projectsRes] = await Promise.all([
        API.get('auth/users/').catch(() => ({ data: [] })),
        API.get('auth/branches/').catch(() => ({ data: [] })),
        API.get('tickets/').catch(() => ({ data: [] })),
        API.get('projects/').catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setBranches(branchesRes.data || []);
      setTickets(ticketsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const recentTickets = tickets.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span style={{ ...badgeStyle, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>Draft</span>;
      case 'pending_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309' }}>Pending Exec</span>;
      case 'rejected_by_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>Rejected by Exec</span>;
      case 'pending_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#e0e7ff', color: '#4338ca' }}>Pending Director</span>;
      case 'rejected_by_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#fff1f2', color: '#be123c' }}>Rejected by Director</span>;
      case 'approved':
        return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d' }}>Approved / In Dev</span>;
      case 'completed':
        return <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#166534' }}>Completed</span>;
      case 'closed':
        return <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>Closed</span>;
      default:
        return <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 4 Stat Cards in Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setActivePage('users')}
          style={{ ...newStatCardStyle, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={statLabelStyle}>Total User Accounts</span>
            <Users size={18} color="#2563eb" />
          </div>
          <span style={{ ...statValueStyle, color: '#0f172a' }}>{users.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all 6 system roles</span>
        </div>

        <div
          onClick={() => setActivePage('branches')}
          style={{ ...newStatCardStyle, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={statLabelStyle}>Active Branches</span>
            <Building2 size={18} color="#0891b2" />
          </div>
          <span style={{ ...statValueStyle, color: '#0891b2' }}>{branches.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Organizational branches</span>
        </div>

        <div
          onClick={() => setActivePage('tickets')}
          style={{ ...newStatCardStyle, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={statLabelStyle}>System Tickets</span>
            <FileText size={18} color="#4338ca" />
          </div>
          <span style={{ ...statValueStyle, color: '#4338ca' }}>{tickets.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Software proposal lifecycle</span>
        </div>

        <div
          onClick={() => setActivePage('projects')}
          style={{ ...newStatCardStyle, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={statLabelStyle}>Approved IT Projects</span>
            <Layers size={18} color="#16a34a" />
          </div>
          <span style={{ ...statValueStyle, color: '#16a34a' }}>{projects.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Provisioned development</span>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div style={{ ...contentCardStyle, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
          Administrator Quick Operations
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActivePage('users')}
            style={actionBtnBlue}
          >
            <UserPlus size={16} style={{ marginRight: '6px' }} />
            Manage User Accounts
          </button>
          
          <button
            onClick={() => setActivePage('branches')}
            style={actionBtnOutline}
          >
            <PlusCircle size={16} style={{ marginRight: '6px' }} />
            Configure Branches
          </button>

          <button
            onClick={() => setActivePage('tickets')}
            style={actionBtnNeutral}
          >
            <FileText size={16} style={{ marginRight: '6px' }} />
            Audit System Tickets
          </button>

          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...actionBtnNeutral,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#475569',
            }}
          >
            <ExternalLink size={16} style={{ marginRight: '6px' }} />
            Django Admin Panel
          </a>
        </div>
      </div>

      {/* Dual Section: Recent Tickets & Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* Recent Tickets Table */}
        <div style={contentCardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Tickets</h2>
            <button
              onClick={() => setActivePage('tickets')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              View All ({tickets.length}) →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : recentTickets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No tickets yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Project Name</th>
                    <th style={thStyle}>Branch</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>#TK-{t.ticket_id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{t.branch_name || 'Org'}</td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users Table */}
        <div style={contentCardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>System Accounts</h2>
            <button
              onClick={() => setActivePage('users')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Manage Users ({users.length}) →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
          ) : recentUsers.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={thStyle}>Username</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Branch</th>
                    <th style={thStyle}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{u.username}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={roleBadgeStyle}>{u.user_type || (u.is_superuser ? 'Superuser' : 'No Role')}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.branch_name || 'All / Global'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: u.is_active ? '#16a34a' : '#dc2626',
                          fontWeight: 500,
                          fontSize: '0.78rem',
                        }}>
                          {u.is_active ? '● Active' : '○ Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

// STYLES
const newStatCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const statLabelStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  fontWeight: 500,
  display: 'block',
};

const statValueStyle = {
  fontSize: '1.8rem',
  fontWeight: 700,
};

const contentCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
};

const cardHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const thStyle = {
  padding: '12px 16px',
  fontWeight: 600,
  textTransform: 'uppercase',
  fontSize: '0.72rem',
  letterSpacing: '0.05em',
};

const roleBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#eff6ff',
  color: '#1d4ed8',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
};

const badgeStyle = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '20px',
  fontSize: '0.72rem',
  fontWeight: 600,
  lineHeight: 1.5,
};

const actionBtnBlue = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: '1px solid #2563eb',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const actionBtnOutline = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  color: '#2563eb',
  border: '1px solid #bfdbfe',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const actionBtnNeutral = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  color: '#334155',
  border: '1px solid #e2e8f0',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};
