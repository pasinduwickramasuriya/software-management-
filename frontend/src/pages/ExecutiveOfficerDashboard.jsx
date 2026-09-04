import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { CheckCircle2, XCircle, Edit3, Eye, FileText, Clock, AlertCircle, MessageSquare, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const pendingCount = tickets.filter(t => t.status === 'pending_executive').length;
  const approvedCount = tickets.filter(t => t.status === 'pending_director' || t.status === 'approved').length;
  const rejectedCount = tickets.filter(t => t.status === 'rejected_by_executive').length;
  const completedCount = tickets.filter(t => t.status === 'completed').length;

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
        <div style={statCardStyle}>
          <span style={{ color: '#b45309', fontSize: '0.85rem' }}>Pending</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#b45309' }}>{pendingCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#15803d', fontSize: '0.85rem' }}>Approved & Sent</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#15803d' }}>{approvedCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>Rejected</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{rejectedCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#166534', fontSize: '0.85rem' }}>Completed</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#166534' }}>{completedCount}</span>
        </div>
      </div>

      {/* Search Bar Card */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No tickets submitted for review in your branch yet.
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
              {tickets.filter(t =>
                    t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    `#${t.ticket_id}`.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((t) => (
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
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.88rem', color: '#334155' }}>
                        <FileText size={16} color="#2563eb" />
                        <span>{doc.file_name}</span>
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