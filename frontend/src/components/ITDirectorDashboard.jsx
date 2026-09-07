import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import API from '../services/api';
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  AlertCircle,
  ShieldCheck,
  Search,
  ChevronDown,
} from 'lucide-react';

const TABS = ['Action Required', 'Approved / In Dev', 'Rejected', 'All Executive-Approved'];

export default function ITDirectorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewingTicket, setViewingTicket] = useState(null);
  const [decisionTicket, setDecisionTicket] = useState(null);

  // Decision form state
  const [decisionType, setDecisionType] = useState('approved');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('Action Required');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);

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

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      alert('Please enter minute / decision remarks.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`tickets/${decisionTicket.ticket_id}/director-decision/`, {
        decision: decisionType,
        remark: remark,
      });
      alert(
        `Ticket #${decisionTicket.ticket_id} ${
          decisionType === 'approved'
            ? 'Approved — moved to IT development'
            : 'Rejected & sent back to Branch'
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
      case 'pending_director':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#ede9fe', color: '#5b21b6' }}>
            <Clock size={12} /> Pending Director
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
          <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={12} /> Approved / In Dev
          </span>
        );
      case 'completed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#166534' }}>
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'rejected_by_executive':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <AlertCircle size={12} /> Rejected by Executive
          </span>
        );
      case 'closed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f3f4f6', color: '#6b7280' }}>
            <XCircle size={12} /> Closed
          </span>
        );
      default:
        return <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  const getExecutiveReview = (ticket) => {
    const approval = (ticket.approvals || []).find((a) => a.decision_role === 'executive' || a.decision_as);
    if (!approval) return null;
    return approval;
  };

  // Branch list for filter dropdown
  const branchOptions = useMemo(() => {
    const names = new Set(tickets.map((t) => t.branch_name).filter(Boolean));
    return ['All Branches', ...Array.from(names)];
  }, [tickets]);

  // Counts
  const actionRequiredCount = tickets.filter((t) => t.status === 'pending_director').length;
  const approvedCount = tickets.filter((t) => t.status === 'approved' || t.status === 'completed').length;
  const rejectedCount = tickets.filter((t) => t.status === 'rejected_by_director').length;
  const allExecutiveApprovedCount = tickets.filter((t) =>
    ['pending_director', 'approved', 'rejected_by_director', 'completed'].includes(t.status)
  ).length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${t.ticket_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.branch_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (branchFilter !== 'All Branches' && t.branch_name !== branchFilter) return false;

    if (activeTab === 'Action Required') return t.status === 'pending_director';
    if (activeTab === 'Approved / In Dev') return t.status === 'approved' || t.status === 'completed';
    if (activeTab === 'Rejected') return t.status === 'rejected_by_director';
    if (activeTab === 'All Executive-Approved')
      return ['pending_director', 'approved', 'rejected_by_director', 'completed'].includes(t.status);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={22} color="#0f172a" />
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>
            IT Authorization &amp; Tickets Console
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Review and decide on software tickets endorsed by Branch Executive Officers.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setActiveTab('Action Required')}
          style={{
            ...statCardStyle,
            cursor: 'pointer',
            borderColor: activeTab === 'Action Required' ? '#6366f1' : '#e2e8f0',
            borderWidth: activeTab === 'Action Required' ? '2px' : '1px',
          }}
        >
          <div style={statCardTopRow}>
            <span style={{ color: '#4338ca', fontSize: '0.85rem', fontWeight: 600 }}>Action Required</span>
            <Clock size={16} color="#4338ca" />
          </div>
          <span style={{ fontSize: '1.9rem', fontWeight: 700, color: '#1e1b4b' }}>{actionRequiredCount}</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Awaiting Director Decision</span>
        </div>

        <div style={statCardStyle}>
          <div style={statCardTopRow}>
            <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>Approved Projects</span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <span style={{ fontSize: '1.9rem', fontWeight: 700, color: '#14532d' }}>{approvedCount}</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>In IT Development</span>
        </div>

        <div style={statCardStyle}>
          <div style={statCardTopRow}>
            <span style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>Rejected</span>
            <AlertCircle size={16} color="#dc2626" />
          </div>
          <span style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7f1d1d' }}>{rejectedCount}</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Returned to Branches</span>
        </div>

        <div style={statCardStyle}>
          <div style={statCardTopRow}>
            <span style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600 }}>Executive-Approved</span>
            <FileText size={16} color="#475569" />
          </div>
          <span style={{ fontSize: '1.9rem', fontWeight: 700, color: '#0f172a' }}>{allExecutiveApprovedCount}</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>All forwarded tickets</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'visible' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 16px 0 16px',
          }}
        >
          <div style={pillTabsContainerStyle}>
            <div
              style={{
                ...slidingIndicatorStyle,
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
            {TABS.map((tab) => {
              let count = 0;
              if (tab === 'Action Required') count = actionRequiredCount;
              if (tab === 'Approved / In Dev') count = approvedCount;
              if (tab === 'Rejected') count = rejectedCount;
              if (tab === 'All Executive-Approved') count = allExecutiveApprovedCount;

              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  ref={(el) => (tabRefs.current[tab] = el)}
                  onClick={() => setActiveTab(tab)}
                  style={isActive ? pillTabActiveStyle : pillTabStyle}
                >
                  {tab === 'Action Required' && isActive && <span style={{ fontSize: '0.85rem' }}>⚡</span>}
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search project, ticket, branch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  width: '260px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBranchMenuOpen((v) => !v)}
                style={branchDropdownBtnStyle}
              >
                {branchFilter}
                <ChevronDown size={14} />
              </button>
              {branchMenuOpen && (
                <div style={branchDropdownMenuStyle}>
                  {branchOptions.map((b) => (
                    <div
                      key={b}
                      onClick={() => {
                        setBranchFilter(b);
                        setBranchMenuOpen(false);
                      }}
                      style={{
                        ...branchDropdownItemStyle,
                        backgroundColor: branchFilter === b ? '#f1f5f9' : 'transparent',
                        fontWeight: branchFilter === b ? 600 : 500,
                      }}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div style={{ marginTop: '16px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              {tickets.length === 0
                ? 'No executive-approved tickets awaiting director review yet.'
                : 'No tickets match the selected filter or search.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #e2e8f0' }}>
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
                  const review = getExecutiveReview(t);
                  return (
                    <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#2563eb' }}>#{t.ticket_id}</td>
                      <td style={tdStyle}>
                        <span style={branchPillStyle}>{t.branch_name || '—'}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{t.created_by_name}</td>
                      <td style={tdStyle}>
                        {review ? (
                          <div>
                            <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.82rem' }}>
                              ✓ {review.decision_as || 'Executive'}
                            </div>
                            {review.remark && (
                              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                "{review.remark}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={tdStyle}>{getStatusBadge(t.status)}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {t.status === 'pending_director' && (
                            <button
                              onClick={() => {
                                setDecisionTicket(t);
                                setDecisionType('approved');
                                setRemark('');
                              }}
                              style={decideBtnStyle}
                            >
                              Decide
                            </button>
                          )}
                          <button onClick={() => setViewingTicket(t)} style={viewLinkStyle}>
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DECISION MODAL */}
      {decisionTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Director Authorization for Ticket #{decisionTicket.ticket_id}</h3>
              <button onClick={() => setDecisionTicket(null)} style={closeBtnStyle}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Decision Choice</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#16a34a' }}>
                    <input
                      type="radio"
                      name="director-decision"
                      value="approved"
                      checked={decisionType === 'approved'}
                      onChange={() => setDecisionType('approved')}
                    />
                    ✅ Authorize (Move to IT Development)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                    <input
                      type="radio"
                      name="director-decision"
                      value="rejected"
                      checked={decisionType === 'rejected'}
                      onChange={() => setDecisionType('rejected')}
                    />
                    ❌ Reject (Send back to Branch)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Minutes / Review Remarks (Required)</label>
                <textarea
                  placeholder={
                    decisionType === 'approved'
                      ? 'Enter authorization remarks or notes...'
                      : 'Enter reason for rejection so the branch can review...'
                  }
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                  rows={4}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setDecisionTicket(null)} style={secondaryBtnStyle}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...primaryBtnStyle, backgroundColor: decisionType === 'approved' ? '#16a34a' : '#dc2626' }}
                >
                  {submitting ? 'Submitting...' : decisionType === 'approved' ? 'Confirm Authorization' : 'Confirm Rejection'}
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
              <button onClick={() => setViewingTicket(null)} style={closeBtnStyle}>
                <XCircle size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Branch:</strong>
                <p style={{ margin: '4px 0' }}>{viewingTicket.branch_name || '—'}</p>
              </div>
              <div>
                <strong>Project Name:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>
                  {viewingTicket.project_name}
                </p>
              </div>
              <div>
                <strong>Status:</strong>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(viewingTicket.status)}</div>
              </div>
              <div>
                <strong>Requirements:</strong>
                <p
                  style={{
                    margin: '4px 0',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
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
              {viewingTicket.approvals && viewingTicket.approvals.length > 0 && (
                <div>
                  <strong>Review Minutes &amp; Remarks:</strong>
                  {viewingTicket.approvals.map((app, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: app.decision === 'approved' ? '#f0fdf4' : '#fef2f2',
                        padding: '10px',
                        borderRadius: '6px',
                        marginTop: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
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

const decideBtnStyle = {
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '7px 16px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
};

const viewLinkStyle = {
  backgroundColor: 'transparent',
  color: '#475569',
  border: 'none',
  padding: '7px 4px',
  fontSize: '0.82rem',
  fontWeight: 500,
  cursor: 'pointer',
};

const closeBtnStyle = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
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

const statCardTopRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '0.76rem',
  fontWeight: 600,
};

const branchPillStyle = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '6px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  fontSize: '0.78rem',
  fontWeight: 500,
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

const thStyle = {
  padding: '10px 16px',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '14px 16px',
};

const pillTabsContainerStyle = {
  position: 'relative',
  display: 'inline-flex',
  gap: '4px',
};

const slidingIndicatorStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  borderRadius: '8px',
  backgroundColor: '#eef2ff',
  transition: 'left 0.25s ease, width 0.25s ease',
};

const pillTabStyle = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#64748b',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'color 0.2s ease',
};

const pillTabActiveStyle = {
  ...pillTabStyle,
  color: '#4338ca',
  fontWeight: 600,
};

const branchDropdownBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#fff',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#334155',
  cursor: 'pointer',
};

const branchDropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  minWidth: '180px',
  zIndex: 10,
  overflow: 'hidden',
};

const branchDropdownItemStyle = {
  padding: '9px 14px',
  fontSize: '0.85rem',
  color: '#334155',
  cursor: 'pointer',
};
