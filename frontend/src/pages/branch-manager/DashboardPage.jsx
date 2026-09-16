import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Eye, Edit3, Send, XCircle } from 'lucide-react';

export default function DashboardPage({ setActivePage }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // 'pending' | 'approved' | 'rejected' | null (= total)

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

  // Filter predicates — shared by the stat cards and the table below
  const filters = {
    pending: (t) => t.status === 'pending_executive' || t.status === 'pending_director',
    approved: (t) => t.status === 'approved',
    rejected: (t) => t.status.includes('rejected') || t.status === 'closed',
  };

  // Stats Logic
  const totalCount = tickets.length;
  const pendingCount = tickets.filter(filters.pending).length;
  const approvedCount = tickets.filter(filters.approved).length;
  const rejectedClosedCount = tickets.filter(filters.rejected).length;

  // Toggle: clicking the active card clears the filter, clicking another switches it
  const handleCardClick = (key) => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  const visibleTickets = activeFilter ? tickets.filter(filters[activeFilter]) : tickets;
  const recentTickets = visibleTickets.slice(0, 5); // Show top 5 of the current filter

  // Pass the active filter along when navigating to the full View Tickets page,
  // so the selection carries over instead of resetting.
  const goToView = () => {
    if (setActivePage.length > 1) {
      setActivePage('view', activeFilter);
    } else {
      setActivePage('view');
    }
  };

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

  // Card definitions: filterKey null = "Total" (acts as the "clear filter" card)
  const cardDefs = [
    { filterKey: null, label: 'Total Created', value: totalCount, accent: '#94a3b8', textColor: '#0f172a', tint: '#f8fafc', tooltip: 'Show all tickets' },
    { filterKey: 'pending', label: 'Pending Review', value: pendingCount, accent: '#f59e0b', textColor: '#d97706', tint: '#fffbeb', tooltip: 'Click to filter by Pending Review' },
    { filterKey: 'approved', label: 'Accepted / Active', value: approvedCount, accent: '#16a34a', textColor: '#16a34a', tint: '#f0fdf4', tooltip: 'Click to filter by Accepted / Active' },
    { filterKey: 'rejected', label: 'Rejected / Closed', value: rejectedClosedCount, accent: '#dc2626', textColor: '#dc2626', tint: '#fef2f2', tooltip: 'Click to filter by Rejected / Closed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Stats — click a card to filter the table below; click again to clear */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {cardDefs.map(({ filterKey, label, value, accent, textColor, tint, tooltip }) => {
          const isActive = activeFilter === filterKey && filterKey !== null;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleCardClick(filterKey)}
              title={tooltip}
              aria-pressed={isActive}
              style={{
                ...newStatCardStyle,
                borderLeft: `4px solid ${accent}`,
                backgroundColor: isActive ? tint : '#ffffff',
                boxShadow: isActive ? `0 0 0 2px ${accent}33` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
              }}
            >
              <span style={statLabelStyle}>{label}</span>
              <span style={{ ...statValueStyle, color: textColor }}>{value}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            {activeFilter
              ? `${cardDefs.find((c) => c.filterKey === activeFilter)?.label} Tickets`
              : 'Recent Tickets'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Clear filter ✕
              </button>
            )}
            <button
              onClick={goToView}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              View All →
            </button>
          </div>
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
                      <button onClick={goToView} style={actionBtnNeutral}>Go to View</button>
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      {activeFilter ? 'No tickets match this filter.' : 'No tickets created yet.'}
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
  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
};
const statLabelStyle = { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 };
const statValueStyle = { fontSize: '2rem', fontWeight: 700, lineHeight: 1 };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.5 };
const actionBtnNeutral = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };
