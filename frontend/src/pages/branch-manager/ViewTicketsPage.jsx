import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import API from '../../services/api';
import { Search, XCircle, FileText, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';

const TABS = ['All', 'Drafts', 'Pending Review', 'Approved', 'Completed', 'Closed'];

export default function ViewTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await API.get(doc.file_url, {
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
      alert('Failed to download document.');
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
      case 'completed': return <span style={{ ...badgeStyle, bg: '#f0fdf4', color: '#166534' }}>Completed</span>;
      case 'closed': return <span style={{ ...badgeStyle, bg: '#f1f5f9', color: '#475569' }}>Closed</span>;
      default: return <span style={{ ...badgeStyle, bg: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  // Tabs Logic
  const totalCount = tickets.length;
  const draftCount = tickets.filter(t => t.status === 'draft').length;
  const pendingCount = tickets.filter(t => t.status === 'pending_executive' || t.status === 'pending_director').length;
  const approvedCount = tickets.filter(t => t.status === 'approved').length;
  const completedCount = tickets.filter(t => t.status === 'completed').length;
  const closedCount = tickets.filter(t => t.status.includes('rejected') || t.status === 'closed').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          `#TK-${t.ticket_id}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'All') return true;
    if (activeTab === 'Drafts') return t.status === 'draft';
    if (activeTab === 'Pending Review') return t.status === 'pending_executive' || t.status === 'pending_director';
    if (activeTab === 'Approved') return t.status === 'approved';
    if (activeTab === 'Completed') return t.status === 'completed';
    if (activeTab === 'Closed') return t.status.includes('rejected') || t.status === 'closed';
    return true;
  });

  // Pagination slicing & calculations
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTickets.length);
  const currentTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={24} color="#2563EB" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
              All Branch Tickets
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              View, track, and manage all ticket proposals raised by your branch
            </p>
          </div>
        </div>
      </div>


      {/* Filters Bar */}
      <div>
        {/* Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
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
              if (tab === 'Drafts') count = draftCount;
              if (tab === 'Pending Review') count = pendingCount;
              if (tab === 'Approved') count = approvedCount;
              if (tab === 'Completed') count = completedCount;
              if (tab === 'Closed') count = closedCount;

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
              placeholder="Search by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '36px', width: '250px', borderRadius: '20px', padding: '8px 12px 8px 36px' }}
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTickets.map((t) => (
                  <tr key={t.ticket_id} style={{ borderBottom: '1px solid #f8fafc', backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#3b82f6' }}>#TK-{t.ticket_id}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>{t.project_name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      {new Date(t.created_at).toISOString().split('T')[0]}
                    </td>
                    <td style={{ padding: '16px 24px' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {t.status === 'draft' && (
                          <>
                            <button onClick={() => setEditingTicket(t)} style={actionBtnBlue}>Edit</button>
                            <button onClick={() => handleSendToExecutive(t.ticket_id)} style={actionBtnOutline}>Send</button>
                            <button onClick={() => handleCloseTicket(t.ticket_id)} style={actionBtnDangerOutline}>Close</button>
                          </>
                        )}
                        {(t.status === 'rejected_by_executive' || t.status === 'rejected_by_director') && (
                          <>
                            <button onClick={() => setViewingTicket(t)} style={actionBtnNeutral}>View</button>
                            <button onClick={() => handleCloseTicket(t.ticket_id)} style={actionBtnDangerOutline}>Close</button>
                          </>
                        )}
                        {(t.status !== 'draft' && t.status !== 'rejected_by_executive' && t.status !== 'rejected_by_director') && (
                          <button onClick={() => setViewingTicket(t)} style={actionBtnNeutral}>View</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No tickets match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {filteredTickets.length > 0 && (
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Showing <strong style={{ color: '#0f172a' }}>{startIndex + 1}</strong> to{' '}
                  <strong style={{ color: '#0f172a' }}>{endIndex}</strong> of{' '}
                  <strong style={{ color: '#0f172a' }}>{filteredTickets.length}</strong> tickets
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...paginationBtnStyle,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.45 : 1,
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getPageNumbers().map((page, idx) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: '0.85rem' }}>
                            ...
                          </span>
                        );
                      }
                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            ...paginationPageNumStyle,
                            backgroundColor: isCurrent ? '#2563eb' : '#ffffff',
                            color: isCurrent ? '#ffffff' : '#475569',
                            borderColor: isCurrent ? '#2563eb' : '#e2e8f0',
                          }}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      ...paginationBtnStyle,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.45 : 1,
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Edit Ticket #TK-{editingTicket.ticket_id}</h3>
              <button onClick={() => setEditingTicket(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleEditTicket}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Project Name</label>
                <input type="text" value={editingTicket.project_name} onChange={(e) => setEditingTicket({ ...editingTicket, project_name: e.target.value })} required style={inputStyleFull} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Requirements</label>
                <textarea value={editingTicket.requirements} onChange={(e) => setEditingTicket({ ...editingTicket, requirements: e.target.value })} required rows={5} style={inputStyleFull} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEditingTicket(null)} style={actionBtnNeutral}>Cancel</button>
                <button type="submit" disabled={submitting} style={actionBtnBlue}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Ticket #TK-{viewingTicket.ticket_id} Details</h3>
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
                <p style={{ margin: '4px 0', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {viewingTicket.requirements}
                </p>
              </div>
              {viewingTicket.documents && viewingTicket.documents.length > 0 && (
                <div>
                  <strong>Attached Documents:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {viewingTicket.documents.map((doc, idx) => {
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDownloadDocument(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.88rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                        >
                          <FileText size={16} color="#2563eb" />
                          <span>{doc.file_name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingTicket(null)} style={actionBtnNeutral}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
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

const badgeStyle = { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.5 };
const inputStyle = { border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' };
const inputStyleFull = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' };

const actionBtnBlue = { backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #2563eb', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };
const actionBtnOutline = { backgroundColor: '#ffffff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };
const actionBtnDangerOutline = { backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };
const actionBtnNeutral = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '550px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };

const paginationBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#334155',
  fontSize: '0.82rem',
  fontWeight: 500,
  transition: 'all 0.15s ease',
};

const paginationPageNumStyle = {
  minWidth: '32px',
  height: '32px',
  padding: '0 6px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '0.82rem',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
