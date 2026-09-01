import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  AlertCircle,
  Building2,
  Filter,
  CheckCheck,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function ITDirectorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [viewingTicket, setViewingTicket] = useState(null);
  const [decisionTicket, setDecisionTicket] = useState(null); // ticket being approved/rejected

  // Decision Form State
  const [decisionType, setDecisionType] = useState('approved'); // 'approved' or 'rejected'
  const [remark, setRemark] = useState('');
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

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      alert('Please enter decision remarks / minutes.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`tickets/${decisionTicket.ticket_id}/director-decision/`, {
        decision: decisionType,
        remark: remark,
      });
      alert(
        `Ticket #${decisionTicket.ticket_id} has been ${
          decisionType === 'approved'
            ? 'Authorized & Approved for IT Development'
            : 'Rejected & returned to Branch'
        }!`
      );
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
      case 'draft':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
            <Clock size={12} /> Draft
          </span>
        );
      case 'pending_executive':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Clock size={12} /> Pending Executive
          </span>
        );
      case 'rejected_by_executive':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <AlertCircle size={12} /> Rejected by Exec
          </span>
        );
      case 'pending_director':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
            <Clock size={12} /> Pending Director Review
          </span>
        );
      case 'rejected_by_director':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#fff1f2', color: '#be123c' }}>
            <AlertCircle size={12} /> Rejected by Director
          </span>
        );
      case 'approved':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={12} /> Approved / In Dev
          </span>
        );
      case 'completed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#166534' }}>
            <CheckCheck size={12} /> Completed
          </span>
        );
      case 'closed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f3f4f6', color: '#6b7280' }}>
            <XCircle size={12} /> Closed
          </span>
        );
      default:
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
            {status}
          </span>
        );
    }
  };

  // Extract unique branches for filter dropdown
  const branchList = Array.from(new Set(tickets.map((t) => t.branch_name).filter(Boolean)));

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Tab filter
    if (activeTab === 'pending' && t.status !== 'pending_director') {
      return false;
    }
    // Branch filter
    if (branchFilter !== 'all' && t.branch_name !== branchFilter) {
      return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProject = t.project_name?.toLowerCase().includes(q);
      const matchBranch = t.branch_name?.toLowerCase().includes(q);
      const matchId = t.ticket_id?.toString().includes(q);
      const matchCreator = t.created_by_name?.toLowerCase().includes(q);
      if (!matchProject && !matchBranch && !matchId && !matchCreator) {
        return false;
      }
    }
    return true;
  });

  const pendingDirectorCount = tickets.filter((t) => t.status === 'pending_director').length;
  const approvedCount = tickets.filter((t) => t.status === 'approved' || t.status === 'completed').length;
  const rejectedCount = tickets.filter((t) => t.status === 'rejected_by_director').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} color="#4338ca" /> IT Director Authorization Dashboard
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Review and authorize software request tickets forwarded by Branch Executive Officers across all branches.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setActiveTab('pending')}
          style={{
            ...statCardStyle,
            borderLeft: '4px solid #4338ca',
            cursor: 'pointer',
            backgroundColor: activeTab === 'pending' ? '#f5f3ff' : '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4338ca', fontSize: '0.85rem', fontWeight: 600 }}>Awaiting IT Authorization</span>
            <Clock size={18} color="#4338ca" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#4338ca' }}>{pendingDirectorCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Approved by branch executives</span>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          style={{
            ...statCardStyle,
            borderLeft: '4px solid #16a34a',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>Approved / In Development</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{approvedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Under IT Development</span>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          style={{
            ...statCardStyle,
            borderLeft: '4px solid #dc2626',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>Rejected by Director</span>
            <AlertCircle size={18} color="#dc2626" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{rejectedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Returned to branches</span>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          style={{
            ...statCardStyle,
            borderLeft: '4px solid #64748b',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Total All Tickets</span>
            <Building2 size={18} color="#64748b" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{tickets.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all organizational branches</span>
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Navigation Tabs & Filters Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                ...tabBtnStyle,
                backgroundColor: activeTab === 'pending' ? '#4338ca' : '#ffffff',
                color: activeTab === 'pending' ? '#ffffff' : '#475569',
                borderColor: activeTab === 'pending' ? '#4338ca' : '#cbd5e1',
              }}
            >
              ⚡ Pending Review ({pendingDirectorCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                ...tabBtnStyle,
                backgroundColor: activeTab === 'all' ? '#4338ca' : '#ffffff',
                color: activeTab === 'all' ? '#ffffff' : '#475569',
                borderColor: activeTab === 'all' ? '#4338ca' : '#cbd5e1',
              }}
            >
              📑 All Tickets ({tickets.length})
            </button>
          </div>

          {/* Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search ticket, branch, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  ...inputStyle,
                  width: '220px',
                  paddingLeft: '32px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Branch Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#64748b" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="all">All Branches</option>
                {branchList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {activeTab === 'pending'
              ? '🎉 No tickets currently pending IT Director authorization!'
              : 'No tickets matched your filter criteria.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Branch</th>
                <th style={{ padding: '12px 16px' }}>Project Name</th>
                <th style={{ padding: '12px 16px' }}>Requester</th>
                <th style={{ padding: '12px 16px' }}>Exec Review Minute</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                // Find executive approval minute if present
                const execApproval = t.approvals?.find(
                  (a) => a.decision_as === 'Executive Officer' || a.decision_as === 'executive_officer'
                );

                return (
                  <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>#{t.ticket_id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Building2 size={12} /> {t.branch_name || 'Organization'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.created_by_name}</td>
                    <td style={{ padding: '12px 16px', maxWidth: '220px' }}>
                      {execApproval ? (
                        <div style={{ fontSize: '0.82rem', color: '#15803d', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>✅ Approved by {execApproval.reviewer_name}</span>
                          <span
                            style={{
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            "{execApproval.remark}"
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None yet</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* View Details */}
                        <button onClick={() => setViewingTicket(t)} style={iconBtnStyle} title="View Details">
                          <Eye size={15} /> View
                        </button>

                        {/* Review / Authorize Button for Pending Director */}
                        {t.status === 'pending_director' && (
                          <button
                            onClick={() => {
                              setDecisionTicket(t);
                              setDecisionType('approved');
                              setRemark('');
                            }}
                            style={{
                              ...iconBtnStyle,
                              backgroundColor: '#4338ca',
                              color: '#ffffff',
                              borderColor: '#4338ca',
                              fontWeight: 600,
                            }}
                            title="Authorize or Reject Ticket"
                          >
                            <ShieldCheck size={15} /> Decide
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* IT DIRECTOR DECISION MODAL */}
      {decisionTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>
                  IT Director Review: Ticket #{decisionTicket.ticket_id}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Branch: <strong>{decisionTicket.branch_name}</strong> | Project:{' '}
                  <strong>{decisionTicket.project_name}</strong>
                </span>
              </div>
              <button
                onClick={() => setDecisionTicket(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            {/* Show Executive Officer Note */}
            {decisionTicket.approvals && decisionTicket.approvals.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 600, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} /> Branch Executive Approval Minute:
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#1e293b' }}>
                  "{decisionTicket.approvals[decisionTicket.approvals.length - 1].remark}"
                </p>
                <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                  Reviewed by {decisionTicket.approvals[decisionTicket.approvals.length - 1].reviewer_name} (Executive Officer)
                </span>
              </div>
            )}

            <form onSubmit={handleDecisionSubmit}>
              {/* Radio options */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Director Decision</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: decisionType === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      backgroundColor: decisionType === 'approved' ? '#f0fdf4' : '#ffffff',
                      fontWeight: 600,
                      color: '#166534',
                    }}
                  >
                    <input
                      type="radio"
                      name="director_decision"
                      value="approved"
                      checked={decisionType === 'approved'}
                      onChange={() => setDecisionType('approved')}
                    />
                    <div>
                      <div>✅ Authorize & Approve Project for Development</div>
                      <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 400 }}>
                        Transitions ticket to Approved and automatically creates an Approved Project for IT development team.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: decisionType === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      backgroundColor: decisionType === 'rejected' ? '#fef2f2' : '#ffffff',
                      fontWeight: 600,
                      color: '#991b1b',
                    }}
                  >
                    <input
                      type="radio"
                      name="director_decision"
                      value="rejected"
                      checked={decisionType === 'rejected'}
                      onChange={() => setDecisionType('rejected')}
                    />
                    <div>
                      <div>❌ Reject Software Proposal</div>
                      <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 400 }}>
                        Returns ticket to the Branch Manager with rejection reasons and minutes.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Director Remarks & Instructions (Required)</label>
                <textarea
                  placeholder={
                    decisionType === 'approved'
                      ? 'Enter technical directives, architectural notes, or scope approval remarks...'
                      : 'State technical reasons or constraints for rejection...'
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                  rows={4}
                  style={inputStyle}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setDecisionTicket(null)} style={secondaryBtnStyle}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...primaryBtnStyle,
                    backgroundColor: decisionType === 'approved' ? '#16a34a' : '#dc2626',
                  }}
                >
                  {submitting
                    ? 'Submitting...'
                    : decisionType === 'approved'
                    ? 'Confirm Director Authorization'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAILS & AUDIT TRAIL MODAL */}
      {viewingTicket && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '650px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Ticket #{viewingTicket.ticket_id} Details</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Branch: <strong>{viewingTicket.branch_name}</strong> | Requester:{' '}
                  <strong>{viewingTicket.created_by_name}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewingTicket(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <strong>Project Name:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>
                  {viewingTicket.project_name}
                </p>
              </div>

              <div>
                <strong>Current Status:</strong>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(viewingTicket.status)}</div>
              </div>

              <div>
                <strong>Requirements & Specifications:</strong>
                <p
                  style={{
                    margin: '4px 0',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {viewingTicket.requirements}
                </p>
              </div>

              {viewingTicket.documents && viewingTicket.documents.length > 0 && (
                <div>
                  <strong>Attached Specification Documents:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {viewingTicket.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '0.88rem',
                          color: '#334155',
                        }}
                      >
                        <FileText size={16} color="#2563eb" />
                        <span>{doc.file_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Audit Review Trail */}
              <div>
                <strong>Decision & Review History:</strong>
                {viewingTicket.approvals && viewingTicket.approvals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {viewingTicket.approvals.map((app, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: app.decision === 'approved' ? '#f0fdf4' : '#fef2f2',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: app.decision === 'approved' ? '#16a34a' : '#dc2626',
                              fontSize: '0.9rem',
                            }}
                          >
                            {app.decision_as === 'Executive Officer' || app.decision_as === 'executive_officer'
                              ? '🏛️ Branch Executive Officer'
                              : '💻 IT Director'}{' '}
                            ({app.decision === 'approved' ? 'Approved' : 'Rejected'})
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {new Date(app.decision_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: '6px 0 2px', fontSize: '0.9rem', color: '#1e293b' }}>
                          "{app.remark || 'No remark provided'}"
                        </p>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Reviewer: <strong>{app.reviewer_name}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    No review minutes recorded yet.
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingTicket(null)} style={secondaryBtnStyle}>
                Close View
              </button>
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

const tabBtnStyle = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
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
