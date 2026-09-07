import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import API from '../services/api';
import { CheckCircle2, XCircle, Edit3, Eye, FileText, Clock, AlertCircle, MessageSquare, Search, Download } from 'lucide-react';

const TABS = ['All', 'Pending Review', 'Approved & Sent', 'Rejected', 'Completed'];

export default function ExecutiveOfficerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewingTicket, setViewingTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [decisionTicket, setDecisionTicket] = useState(null); // ticket being approved/rejected

  // Decision Form State
  const [decisionType, setDecisionType] = useState('approved'); // 'approved' or 'rejected'
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sliding tab indicator
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const node = tabRefs.current[activeTab];
    if (node) {
      setIndicatorStyle({ left: node.offsetLeft, width: node.offsetWidth });
    }
  }, [activeTab, tickets]);

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

  const handleEditTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`tickets/${editingTicket.ticket_id}/`, {
        project_name: editingTicket.project_name,
        requirements: editingTicket.requirements,
      });
      setEditingTicket(null);
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      alert('Please enter minute / decision remarks.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`tickets/${decisionTicket.ticket_id}/executive-decision/`, {
        decision: decisionType,
        remark: remark,
      });
      alert(`Ticket #${decisionTicket.ticket_id} ${decisionType === 'approved' ? 'Approved & forwarded to the IT Director for authorization' : 'Rejected & sent back to Branch Manager'}!`);
      setDecisionTicket(null);
      setRemark('');
      fetchTickets();
    } catch (err) {
      alert('Decision submission failed: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const downloadPath = doc.document_id
        ? `tickets/documents/${doc.document_id}/download/`
        : doc.file_url.replace(/^.*\/api\//, '');

      const response = await API.get(downloadPath, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309' }}><Clock size={12} /> Pending Executive Review</span>;
      case 'rejected_by_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}><AlertCircle size={12} /> Rejected by Executive</span>;
      case 'pending_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}><Clock size={12} /> Pending IT Director</span>;
      case 'rejected_by_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#fff1f2', color: '#be123c' }}><AlertCircle size={12} /> Rejected by IT Director</span>;
      case 'approved':
        return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d' }}><CheckCircle2 size={12} /> Approved / In Development</span>;
      case 'completed':
        return <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#166534' }}><CheckCircle2 size={12} /> Completed</span>;
      case 'closed':
        return <span style={{ ...badgeStyle, backgroundColor: '#f3f4f6', color: '#6b7280' }}><XCircle size={12} /> Closed</span>;
      default:
        return <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  // Tabs & Stats counts
  const totalCount = tickets.length;
  const pendingCount = tickets.filter(t => t.status === 'pending_executive').length;
  const approvedCount = tickets.filter(t => t.status === 'pending_director' || t.status === 'approved').length;
  const rejectedCount = tickets.filter(t => t.status.includes('rejected')).length;
  const completedCount = tickets.filter(t => t.status === 'completed' || t.status === 'closed').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          `#${t.ticket_id}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending Review') return t.status === 'pending_executive';
    if (activeTab === 'Approved & Sent') return t.status === 'pending_director' || t.status === 'approved';
    if (activeTab === 'Rejected') return t.status.includes('rejected');
    if (activeTab === 'Completed') return t.status === 'completed' || t.status === 'closed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
          Executive Officer Dashboard
        </h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Review, edit, approve, or reject software request tickets submitted by your Branch Manager.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setActiveTab('Pending Review')}
          style={{
            ...statCardStyle,
            cursor: 'pointer',
            borderColor: activeTab === 'Pending Review' ? '#f59e0b' : '#e2e8f0',
            backgroundColor: activeTab === 'Pending Review' ? '#fffbeb' : '#ffffff',
            transition: 'all 0.2s ease',
          }}
          title="Click to filter by Pending Review"
        >
          <span style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600 }}>Pending Review</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#b45309' }}>{pendingCount}</span>
        </div>
        <div
          onClick={() => setActiveTab('Approved & Sent')}
          style={{
            ...statCardStyle,
            cursor: 'pointer',
            borderColor: activeTab === 'Approved & Sent' ? '#22c55e' : '#e2e8f0',
            backgroundColor: activeTab === 'Approved & Sent' ? '#f0fdf4' : '#ffffff',
            transition: 'all 0.2s ease',
          }}
          title="Click to filter by Approved & Sent"
        >
          <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>Approved & Sent</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#15803d' }}>{approvedCount}</span>
        </div>
        <div
          onClick={() => setActiveTab('Rejected')}
          style={{
            ...statCardStyle,
            cursor: 'pointer',
            borderColor: activeTab === 'Rejected' ? '#ef4444' : '#e2e8f0',
            backgroundColor: activeTab === 'Rejected' ? '#fef2f2' : '#ffffff',
            transition: 'all 0.2s ease',
          }}
          title="Click to filter by Rejected"
        >
          <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>Rejected</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{rejectedCount}</span>
        </div>
        <div
          onClick={() => setActiveTab('Completed')}
          style={{
            ...statCardStyle,
            cursor: 'pointer',
            borderColor: activeTab === 'Completed' ? '#16a34a' : '#e2e8f0',
            backgroundColor: activeTab === 'Completed' ? '#f0fdf4' : '#ffffff',
            transition: 'all 0.2s ease',
          }}
          title="Click to filter by Completed"
        >
          <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>Completed</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#166534' }}>{completedCount}</span>
        </div>
      </div>

      {/* Filters Bar: Sliding Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
        <div style={pillTabsContainerStyle}>
          {/* Sliding indicator */}
          <div
            style={{
              ...slidingIndicatorStyle,
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
          {TABS.map(tab => {
            let count = 0;
            if (tab === 'All') count = totalCount;
            if (tab === 'Pending Review') count = pendingCount;
            if (tab === 'Approved & Sent') count = approvedCount;
            if (tab === 'Rejected') count = rejectedCount;
            if (tab === 'Completed') count = completedCount;

            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                ref={(el) => (tabRefs.current[tab] = el)}
                onClick={() => setActiveTab(tab)}
                style={isActive ? pillTabActiveStyle : pillTabStyle}
              >
                {tab}
                <span style={isActive ? pillBadgeActiveStyle : pillBadgeStyle}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by project or ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px 8px 36px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              width: '260px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Tickets List Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {tickets.length === 0 ? 'No tickets submitted for review in your branch yet.' : 'No tickets match the selected filter or search.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px' }}>Ticket ID</th>
                <th style={{ padding: '12px 16px' }}>Project Name</th>
                <th style={{ padding: '12px 16px' }}>Created By</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>#{t.ticket_id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.created_by_name}</td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(t.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {/* View Ticket Details */}
                      <button
                        onClick={() => setViewingTicket(t)}
                        style={iconBtnStyle}
                      >
                        <Eye size={16} /> View
                      </button>

                      {/* Edit Ticket */}
                      {(t.status === 'pending_executive' || t.status === 'draft') && (
                        <button
                          onClick={() => setEditingTicket(t)}
                          style={{ ...iconBtnStyle, color: '#2563eb', borderColor: '#bfdbfe' }}
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                      )}

                      {/* Decide Button (Approve or Reject) */}
                      {(t.status === 'pending_executive' || t.status === 'draft') && (
                        <button
                          onClick={() => {
                            setDecisionTicket(t);
                            setDecisionType('approved');
                            setRemark('');
                          }}
                          style={{ ...iconBtnStyle, color: '#ffffff', backgroundColor: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                          title="Approve or Reject Ticket"
                        >
                          <CheckCircle2 size={16} /> Decide
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DECISION MODAL (Approve or Reject with Minutes) */}
      {decisionTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Executive Review for Ticket #{decisionTicket.ticket_id}</h3>
              <button onClick={() => setDecisionTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>

            <form onSubmit={handleDecisionSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Decision Choice</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#16a34a' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decisionType === 'approved'}
                      onChange={() => setDecisionType('approved')}
                    />
                    ✅ Approve Ticket (Send to IT Director)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decisionType === 'rejected'}
                      onChange={() => setDecisionType('rejected')}
                    />
                    ❌ Reject Ticket (Send back to Branch Manager)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Minutes / Review Remarks (Required)</label>
                <textarea
                  placeholder={decisionType === 'approved' ? "Enter approval remarks or notes..." : "Enter reason for rejection so Branch Manager can review or close..."}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                  rows={4}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setDecisionTicket(null)} style={secondaryBtnStyle}>Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...primaryBtnStyle,
                    backgroundColor: decisionType === 'approved' ? '#16a34a' : '#dc2626',
                  }}
                >
                  {submitting ? 'Submitting...' : decisionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {editingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Edit Ticket #{editingTicket.ticket_id} Requirements</h3>
              <button onClick={() => setEditingTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleEditTicket}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Project Name</label>
                <input
                  type="text"
                  value={editingTicket.project_name}
                  onChange={(e) => setEditingTicket({ ...editingTicket, project_name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Requirements & Specs</label>
                <textarea
                  value={editingTicket.requirements}
                  onChange={(e) => setEditingTicket({ ...editingTicket, requirements: e.target.value })}
                  required
                  rows={5}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEditingTicket(null)} style={secondaryBtnStyle}>Cancel</button>
                <button type="submit" disabled={submitting} style={primaryBtnStyle}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {viewingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Ticket #{viewingTicket.ticket_id} Details</h3>
              <button onClick={() => setViewingTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Project Name:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>{viewingTicket.project_name}</p>
              </div>
              <div>
                <strong>Status:</strong>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(viewingTicket.status)}</div>
              </div>
              <div>
                <strong>Requirements:</strong>
                <p style={{ margin: '4px 0', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {viewingTicket.requirements}
                </p>
              </div>
              {viewingTicket.documents && viewingTicket.documents.length > 0 && (
                <div>
                  <strong>Attached Documents:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {viewingTicket.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.88rem',
                          color: '#334155',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="#2563eb" />
                          <span>{doc.file_name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewingTicket.approvals && viewingTicket.approvals.length > 0 && (
                <div>
                  <strong>Review Minutes & Remarks:</strong>
                  {viewingTicket.approvals.map((app, idx) => (
                    <div key={idx} style={{ background: app.decision === 'approved' ? '#f0fdf4' : '#fef2f2', padding: '10px', borderRadius: '6px', marginTop: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 600, color: app.decision === 'approved' ? '#16a34a' : '#dc2626' }}>
                        {app.decision_as} ({app.decision})
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{app.remark || 'No remark provided'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingTicket(null)} style={secondaryBtnStyle}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const primaryBtnStyle = {
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const iconBtnStyle = {
  backgroundColor: '#ffffff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  padding: '6px 12px',
  borderRadius: '6px',
  fontWeight: 500,
  fontSize: '0.82rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const statCardStyle = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '0.78rem',
  fontWeight: 600,
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '550px',
  padding: '24px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const pillTabsContainerStyle = {
  position: 'relative',
  display: 'inline-flex',
  gap: '4px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '20px',
  padding: '4px',
};

const slidingIndicatorStyle = {
  position: 'absolute',
  top: '4px',
  bottom: '4px',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  transition: 'left 0.25s ease, width 0.25s ease',
};

const pillTabStyle = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '16px',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#64748b',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'color 0.2s ease',
};

const pillTabActiveStyle = {
  ...pillTabStyle,
  color: '#0f172a',
  fontWeight: 600,
};

const pillBadgeStyle = {
  backgroundColor: '#e2e8f0',
  color: '#475569',
  fontSize: '0.72rem',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '999px',
  minWidth: '18px',
  textAlign: 'center',
};

const pillBadgeActiveStyle = {
  ...pillBadgeStyle,
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
};