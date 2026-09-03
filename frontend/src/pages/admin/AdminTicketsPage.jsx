import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  FileText,
  Search,
  Filter,
  Building2,
  XCircle,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Modal
  const [viewingTicket, setViewingTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await API.get('tickets/');
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const branchList = Array.from(new Set(tickets.map((t) => t.branch_name).filter(Boolean)));

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

  const filteredTickets = tickets.filter((t) => {
    if (branchFilter !== 'all' && t.branch_name !== branchFilter) return false;

    if (activeTab === 'Drafts' && t.status !== 'draft') return false;
    if (activeTab === 'Pending Executive' && t.status !== 'pending_executive') return false;
    if (activeTab === 'Pending Director' && t.status !== 'pending_director') return false;
    if (activeTab === 'Approved / In Dev' && t.status !== 'approved') return false;
    if (activeTab === 'Completed' && t.status !== 'completed') return false;
    if (activeTab === 'Rejected / Closed' && !t.status.includes('rejected') && t.status !== 'closed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProject = t.project_name?.toLowerCase().includes(q);
      const matchBranch = t.branch_name?.toLowerCase().includes(q);
      const matchCreator = t.created_by_name?.toLowerCase().includes(q);
      const matchId = `#TK-${t.ticket_id}`.toLowerCase().includes(q) || t.ticket_id?.toString().includes(q);
      if (!matchProject && !matchBranch && !matchCreator && !matchId) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Filter Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="#4338ca" /> Complete System Tickets Audit
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Global audit trail of all software request tickets across every department and branch.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Search ticket, project, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  ...inputStyleFull,
                  width: '240px',
                  paddingLeft: '36px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="#64748b" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All Branches</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Row */}
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #f1f5f9', marginTop: '20px', overflowX: 'auto' }}>
          {[
            'All',
            'Drafts',
            'Pending Executive',
            'Pending Director',
            'Approved / In Dev',
            'Completed',
            'Rejected / Closed',
          ].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...tabStyle,
                  color: isActive ? '#2563eb' : '#64748b',
                  fontWeight: isActive ? 600 : 500,
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickets Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            Audited Tickets ({filteredTickets.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No tickets match the selected filters.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={thStyle}>Ticket ID</th>
                  <th style={thStyle}>Branch</th>
                  <th style={thStyle}>Project Name</th>
                  <th style={thStyle}>Requester</th>
                  <th style={thStyle}>Created At</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#3b82f6' }}>#TK-{t.ticket_id}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>
                      <span style={branchBadgeStyle}>
                        <Building2 size={12} /> {t.branch_name || 'Organization'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{t.created_by_name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      {t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '-'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => setViewingTicket(t)} style={actionBtnNeutral}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Ticket #TK-{viewingTicket.ticket_id} Audit Details</h3>
              <button onClick={() => setViewingTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '68vh', overflowY: 'auto' }}>
              <div>
                <strong>Project Name:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>
                  {viewingTicket.project_name}
                </p>
              </div>

              <div>
                <strong>Branch & Requester:</strong>
                <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#475569' }}>
                  {viewingTicket.branch_name || 'Organization'} — requested by <strong>{viewingTicket.created_by_name}</strong>
                </p>
              </div>

              <div>
                <strong>Current Status:</strong>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(viewingTicket.status)}</div>
              </div>

              <div>
                <strong>Requirements:</strong>
                <p style={{ margin: '4px 0', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {viewingTicket.requirements}
                </p>
              </div>

              {viewingTicket.documents && viewingTicket.documents.length > 0 && (
                <div>
                  <strong>Attached Specification Documents:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {viewingTicket.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.88rem',
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="#2563eb" />
                          <span>{doc.file_name}</span>
                        </div>
                        <Download size={14} color="#64748b" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewingTicket.approvals && viewingTicket.approvals.length > 0 && (
                <div>
                  <strong>Decision & Audit Trail:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {viewingTicket.approvals.map((app, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: app.decision === 'approved' ? '#f0fdf4' : '#fef2f2',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#1e293b' }}>
                          <span>{app.decision_as} ({app.reviewer_name})</span>
                          <span style={{ color: app.decision === 'approved' ? '#16a34a' : '#dc2626', textTransform: 'capitalize' }}>
                            {app.decision}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', color: '#334155' }}>"{app.remark}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingTicket(null)} style={actionBtnNeutral}>
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES
const thStyle = {
  padding: '16px 24px',
  fontWeight: 600,
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
};

const branchBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 500,
};

const badgeStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.5,
};

const tabStyle = {
  background: 'none',
  border: 'none',
  padding: '0 0 12px 0',
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const actionBtnNeutral = {
  backgroundColor: '#f8fafc',
  color: '#475569',
  border: '1px solid #e2e8f0',
  padding: '6px 16px',
  borderRadius: '6px',
  fontWeight: 500,
  fontSize: '0.8rem',
  cursor: 'pointer',
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '0.85rem',
  color: '#334155',
  outline: 'none',
};

const inputStyleFull = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '580px',
  padding: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
