import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Eye,
  ShieldCheck,
  XCircle,
  FileText,
  Download,
  Search,
  Filter,
  CheckCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Modals
  const [viewingTicket, setViewingTicket] = useState(null);
  const [decisionTicket, setDecisionTicket] = useState(null);
  const [decisionType, setDecisionType] = useState('approved');
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
      alert('Please enter decision remarks / technical directives.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`tickets/${decisionTicket.ticket_id}/director-decision/`, {
        decision: decisionType,
        remark: remark,
      });
      alert(
        `Ticket #TK-${decisionTicket.ticket_id} has been ${
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

  // Only show tickets that have been approved by the Executive Officer
  const executiveApprovedTickets = tickets.filter((t) =>
    ['pending_director', 'approved', 'rejected_by_director', 'completed'].includes(t.status)
  );

  // Counts
  const pendingDirectorTickets = executiveApprovedTickets.filter((t) => t.status === 'pending_director');
  const pendingCount = pendingDirectorTickets.length;
  const approvedCount = executiveApprovedTickets.filter((t) => t.status === 'approved' || t.status === 'completed').length;
  const rejectedCount = executiveApprovedTickets.filter((t) => t.status === 'rejected_by_director').length;
  const totalCount = executiveApprovedTickets.length;

  // Extract unique branches from executive approved tickets
  const branchList = Array.from(new Set(executiveApprovedTickets.map((t) => t.branch_name).filter(Boolean)));

  // Filter tickets based on active tab, branch, search
  const filteredTickets = executiveApprovedTickets.filter((t) => {
    // 1. Tab filter
    if (activeTab === 'pending' && t.status !== 'pending_director') return false;
    if (activeTab === 'approved' && t.status !== 'approved' && t.status !== 'completed') return false;
    if (activeTab === 'rejected' && t.status !== 'rejected_by_director') return false;

    // 2. Branch filter
    if (branchFilter !== 'all' && t.branch_name !== branchFilter) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProject = t.project_name?.toLowerCase().includes(q);
      const matchBranch = t.branch_name?.toLowerCase().includes(q);
      const matchId = `#TK-${t.ticket_id}`.toLowerCase().includes(q) || t.ticket_id?.toString().includes(q);
      const matchCreator = t.created_by_name?.toLowerCase().includes(q);
      if (!matchProject && !matchBranch && !matchId && !matchCreator) return false;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span style={{ ...badgeStyle, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>Draft</span>;
      case 'pending_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#b45309' }}>Pending Exec</span>;
      case 'rejected_by_executive':
        return <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>Rejected by Exec</span>;
      case 'pending_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>Pending Director</span>;
      case 'rejected_by_director':
        return <span style={{ ...badgeStyle, backgroundColor: '#fff1f2', color: '#be123c' }}>Rejected by Director</span>;
      case 'approved':
        return <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>Approved / In Dev</span>;
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
      
      {/* 4 Interactive Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Action Required (Pending) */}
        <div
          onClick={() => setActiveTab('pending')}
          style={{
            ...newStatCardStyle,
            cursor: 'pointer',
            border: activeTab === 'pending' ? '2px solid #4338ca' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'pending' ? '#f5f3ff' : '#ffffff',
            transform: activeTab === 'pending' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...statLabelStyle, color: activeTab === 'pending' ? '#4338ca' : '#64748b' }}>
              Action Required
            </span>
            <Clock size={16} color="#4338ca" />
          </div>
          <span style={{ ...statValueStyle, color: '#4338ca' }}>{pendingCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting Director Decision</span>
        </div>

        {/* Card 2: Approved */}
        <div
          onClick={() => setActiveTab('approved')}
          style={{
            ...newStatCardStyle,
            cursor: 'pointer',
            border: activeTab === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'approved' ? '#f0fdf4' : '#ffffff',
            transform: activeTab === 'approved' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...statLabelStyle, color: activeTab === 'approved' ? '#16a34a' : '#64748b' }}>
              Approved Projects
            </span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <span style={{ ...statValueStyle, color: '#16a34a' }}>{approvedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>In IT Development</span>
        </div>

        {/* Card 3: Rejected */}
        <div
          onClick={() => setActiveTab('rejected')}
          style={{
            ...newStatCardStyle,
            cursor: 'pointer',
            border: activeTab === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'rejected' ? '#fef2f2' : '#ffffff',
            transform: activeTab === 'rejected' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...statLabelStyle, color: activeTab === 'rejected' ? '#dc2626' : '#64748b' }}>
              Rejected
            </span>
            <AlertCircle size={16} color="#dc2626" />
          </div>
          <span style={{ ...statValueStyle, color: '#dc2626' }}>{rejectedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Returned to Branches</span>
        </div>

        {/* Card 4: Executive-Approved Tickets */}
        <div
          onClick={() => setActiveTab('all')}
          style={{
            ...newStatCardStyle,
            cursor: 'pointer',
            border: activeTab === 'all' ? '2px solid #0f172a' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'all' ? '#f8fafc' : '#ffffff',
            transform: activeTab === 'all' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...statLabelStyle, color: activeTab === 'all' ? '#0f172a' : '#64748b' }}>
              Executive-Approved
            </span>
            <Building2 size={16} color="#0f172a" />
          </div>
          <span style={{ ...statValueStyle, color: '#0f172a' }}>{totalCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>All forwarded tickets</span>
        </div>
      </div>

      {/* Main Unified Table Card */}
      <div style={contentCardStyle}>
        
        {/* Top Control Bar: Tabs + Search + Branch Dropdown */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#2563eb" /> IT Authorization & Tickets Console
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Review and decide on software tickets endorsed by Branch Executive Officers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Search project, ticket, branch..."
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

              {/* Branch Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} color="#64748b" />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
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
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { id: 'pending', label: '⚡ Action Required', count: pendingCount },
              { id: 'approved', label: 'Approved / In Dev', count: approvedCount },
              { id: 'rejected', label: 'Rejected', count: rejectedCount },
              { id: 'all', label: 'All Executive-Approved', count: totalCount },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...tabStyle,
                    color: isActive ? '#2563eb' : '#64748b',
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            {activeTab === 'pending'
              ? '🎉 No tickets currently awaiting IT Director authorization! You are all caught up.'
              : 'No tickets matched the current filter or search criteria.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={thStyle}>Ticket ID</th>
                  <th style={thStyle}>Branch</th>
                  <th style={thStyle}>Project Name</th>
                  <th style={thStyle}>Requester</th>
                  <th style={thStyle}>Executive Review</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => {
                  const execApproval = t.approvals?.find(
                    (a) => a.decision_as === 'Executive Officer' || a.decision_as === 'executive_officer'
                  );
                  return (
                    <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600, color: '#3b82f6' }}>#TK-{t.ticket_id}</td>
                      <td style={{ padding: '16px 24px', color: '#334155' }}>
                        <span style={branchBadgeStyle}>
                          <Building2 size={12} /> {t.branch_name || 'Organization'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                      <td style={{ padding: '16px 24px', color: '#64748b' }}>{t.created_by_name}</td>
                      <td style={{ padding: '16px 24px', maxWidth: '200px' }}>
                        {execApproval ? (
                          <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                            <span style={{ fontWeight: 600 }}>✅ {execApproval.reviewer_name}</span>
                            <div style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{execApproval.remark}"
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>{getStatusBadge(t.status)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {t.status === 'pending_director' && (
                            <button
                              onClick={() => {
                                setDecisionTicket(t);
                                setDecisionType('approved');
                                setRemark('');
                              }}
                              style={actionBtnBlue}
                            >
                              Decide
                            </button>
                          )}
                          <button onClick={() => setViewingTicket(t)} style={actionBtnNeutral}>
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              <span>Showing {filteredTickets.length} tickets</span>
              {activeTab !== 'all' && (
                <button
                  onClick={() => { setActiveTab('all'); setBranchFilter('all'); setSearchQuery(''); }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* IT DIRECTOR DECISION MODAL */}
      {decisionTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>Director Decision: Ticket #TK-{decisionTicket.ticket_id}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Branch: <strong>{decisionTicket.branch_name}</strong> | Project: <strong>{decisionTicket.project_name}</strong>
                </span>
              </div>
              <button onClick={() => setDecisionTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            {decisionTicket.approvals && decisionTicket.approvals.length > 0 && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 600, fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Branch Executive Endorsement:
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#1e293b' }}>
                  "{decisionTicket.approvals[decisionTicket.approvals.length - 1].remark}"
                </p>
                <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                  By {decisionTicket.approvals[decisionTicket.approvals.length - 1].reviewer_name} (Executive Officer)
                </span>
              </div>
            )}

            <form onSubmit={handleDecisionSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Director Decision</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
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
                      name="decision"
                      value="approved"
                      checked={decisionType === 'approved'}
                      onChange={() => setDecisionType('approved')}
                    />
                    <div>
                      <div>✅ Authorize & Approve Project for Development</div>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 400 }}>
                        Transitions ticket to Approved and provisions project for IT development team.
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
                      name="decision"
                      value="rejected"
                      checked={decisionType === 'rejected'}
                      onChange={() => setDecisionType('rejected')}
                    />
                    <div>
                      <div>❌ Reject Software Proposal</div>
                      <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 400 }}>
                        Returns ticket to the Branch Manager with rejection reasons.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Technical Directives & Remarks</label>
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
                  style={inputStyleFull}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setDecisionTicket(null)} style={actionBtnNeutral}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...actionBtnBlue,
                    backgroundColor: decisionType === 'approved' ? '#16a34a' : '#dc2626',
                    borderColor: decisionType === 'approved' ? '#16a34a' : '#dc2626',
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

      {/* VIEW TICKET DETAILS MODAL */}
      {viewingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Ticket #TK-{viewingTicket.ticket_id} Details</h3>
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
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#475569' }}>
                  {viewingTicket.branch_name || 'Organization'} — requested by <strong>{viewingTicket.created_by_name}</strong>
                </p>
              </div>

              <div>
                <strong>Status:</strong>
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
                  <strong>Attached Documents:</strong>
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

const tabStyle = {
  background: 'none',
  border: 'none',
  padding: '0 0 12px 0',
  fontSize: '0.9rem',
  cursor: 'pointer',
};

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

const actionBtnBlue = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: '1px solid #2563eb',
  padding: '6px 16px',
  borderRadius: '6px',
  fontWeight: 500,
  fontSize: '0.8rem',
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

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: '6px',
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
