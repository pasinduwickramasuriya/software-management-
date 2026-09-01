import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Eye, Edit3, Send, XCircle } from 'lucide-react';

export default function DashboardPage({ setActivePage }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await API.get('tickets/');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats Logic
  const totalCount = tickets.length;
  const pendingCount = tickets.filter(t => t.status === 'pending_executive' || t.status === 'pending_director').length;
  const approvedCount = tickets.filter(t => t.status === 'approved').length;
  const rejectedClosedCount = tickets.filter(t => t.status.includes('rejected') || t.status === 'closed').length;

  const recentTickets = tickets.slice(0, 5); // Show top 5

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return <span style={{ ...badgeStyle, bg: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>Draft</span>;
      case 'pending_executive': return <span style={{ ...badgeStyle, bg: '#fef3c7', color: '#b45309' }}>Pending Exec</span>;
      case 'rejected_by_executive': return <span style={{ ...badgeStyle, bg: '#fef2f2', color: '#dc2626' }}>Rejected by Exec</span>;
      case 'pending_director': return <span style={{ ...badgeStyle, bg: '#e0e7ff', color: '#4338ca' }}>Pending Director</span>;
      case 'rejected_by_director': return <span style={{ ...badgeStyle, bg: '#fff1f2', color: '#be123c' }}>Rejected by Director</span>;
      case 'approved': return <span style={{ ...badgeStyle, bg: '#dcfce7', color: '#15803d' }}>Approved / In Dev</span>;
      case 'closed': return <span style={{ ...badgeStyle, bg: '#f1f5f9', color: '#475569' }}>Closed</span>;
      default: return <span style={{ ...badgeStyle, bg: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Stats */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={newStatCardStyle}>
          <span style={statLabelStyle}>Total Created</span>
          <span style={{ ...statValueStyle, color: '#0f172a' }}>{totalCount}</span>
        </div>
        <div style={newStatCardStyle}>
          <span style={statLabelStyle}>Pending Review</span>
          <span style={{ ...statValueStyle, color: '#d97706' }}>{pendingCount}</span>
        </div>
        <div style={newStatCardStyle}>
          <span style={statLabelStyle}>Accepted / Active</span>
          <span style={{ ...statValueStyle, color: '#16a34a' }}>{approvedCount}</span>
        </div>
        <div style={newStatCardStyle}>
          <span style={statLabelStyle}>Rejected / Closed</span>
          <span style={{ ...statValueStyle, color: '#dc2626' }}>{rejectedClosedCount}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Recent Tickets</h2>
          <button 
            onClick={() => setActivePage('view')} 
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Ticket ID</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Project Name</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Created At</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#3b82f6' }}>#TK-{t.ticket_id}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      {new Date(t.created_at).toISOString().split('T')[0]}
                    </td>
                    <td style={{ padding: '16px 24px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => setActivePage('view')} style={actionBtnNeutral}>Go to View</button>
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No tickets created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES
const newStatCardStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
const statLabelStyle = { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 };
const statValueStyle = { fontSize: '2rem', fontWeight: 700, lineHeight: 1 };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.5 };
const actionBtnNeutral = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };
