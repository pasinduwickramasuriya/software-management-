import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Send, XCircle, Edit3, Eye, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function BranchManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const docs = documentName ? [{ file_name: documentName, file_path: `/uploads/${documentName}` }] : [];
    try {
      await API.post('tickets/', {
        project_name: projectName,
        requirements: requirements,
        documents: docs,
      });
      setProjectName('');
      setRequirements('');
      setDocumentName('');
      setShowCreateModal(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to create ticket: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSubmitting(false);
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

  const handleSendToExecutive = async (ticketId) => {
    if (!window.confirm('Send this ticket to Executive Officer for review?')) return;
    try {
      await API.post(`tickets/${ticketId}/send/`);
      fetchTickets();
    } catch (err) {
      alert('Failed to send ticket: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to CLOSE this ticket? It will be marked as closed.')) return;
    try {
      await API.post(`tickets/${ticketId}/close/`);
      fetchTickets();
    } catch (err) {
      alert('Failed to close ticket: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}><Clock size={12} /> Draft</span>;
      case 'pending_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309' }}><Clock size={12} /> Pending Executive</span>;
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

  const draftCount = tickets.filter(t => t.status === 'draft').length;
  const pendingCount = tickets.filter(t => t.status === 'pending_executive').length;
  const rejectedCount = tickets.filter(t => t.status === 'rejected_by_executive').length;
  const approvedCount = tickets.filter(t => t.status === 'approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
            🏢 Branch Manager Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Create software request tickets, track reviews, and manage branch submissions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={primaryBtnStyle}
        >
          <Plus size={18} /> Create New Ticket
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={statCardStyle}>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Draft Tickets</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{draftCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#b45309', fontSize: '0.85rem' }}>Pending Executive</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#b45309' }}>{pendingCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>Rejected by Executive</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{rejectedCount}</span>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#15803d', fontSize: '0.85rem' }}>Approved</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#15803d' }}>{approvedCount}</span>
        </div>
      </div>

      {/* Tickets List Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
            Branch Software Request Tickets
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total: {tickets.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No tickets found for your branch. Click <strong>Create New Ticket</strong> to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px' }}>Ticket ID</th>
                <th style={{ padding: '12px 16px' }}>Project Name</th>
                <th style={{ padding: '12px 16px' }}>Created Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>#{t.ticket_id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(t.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {/* View Button */}
                      <button
                        onClick={() => setViewingTicket(t)}
                        style={iconBtnStyle}
                        title="View Details"
                      >
                        <Eye size={16} /> View
                      </button>

                      {/* Edit Button (Draft or Rejected) */}
                      {(t.status === 'draft' || t.status === 'rejected_by_executive' || t.status === 'rejected_by_director') && (
                        <button
                          onClick={() => setEditingTicket(t)}
                          style={{ ...iconBtnStyle, color: '#2563eb', borderColor: '#bfdbfe' }}
                          title="Edit Ticket"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                      )}

                      {/* Send Button (Draft or Rejected) */}
                      {(t.status === 'draft' || t.status === 'rejected_by_executive') && (
                        <button
                          onClick={() => handleSendToExecutive(t.ticket_id)}
                          style={{ ...iconBtnStyle, color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                          title="Send to Executive Officer"
                        >
                          <Send size={16} /> Send to Executive
                        </button>
                      )}

                      {/* 🔴 CLOSE BUTTON (Appears when Rejected by Executive or Rejected by Director) */}
                      {(t.status === 'rejected_by_executive' || t.status === 'rejected_by_director') && (
                        <button
                          onClick={() => handleCloseTicket(t.ticket_id)}
                          style={{ ...iconBtnStyle, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                          title="Close Rejected Ticket"
                        >
                          <XCircle size={16} /> Close Ticket
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

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Create Software Request Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inventory Management System"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Requirements & Specifications</label>
                <textarea
                  placeholder="Describe system features, user needs, and requirements..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required
                  rows={4}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Attachment / Specification Document (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. System_Requirements_V1.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={secondaryBtnStyle}>Cancel</button>
                <button type="submit" disabled={submitting} style={primaryBtnStyle}>
                  {submitting ? 'Creating...' : 'Save Draft Ticket'}
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
              <h3 style={{ margin: 0 }}>Edit Ticket #{editingTicket.ticket_id}</h3>
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
                <label style={labelStyle}>Requirements</label>
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
                  <strong>Attached Specification Documents:</strong>
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

// Inline Styles
const primaryBtnStyle = {
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
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
