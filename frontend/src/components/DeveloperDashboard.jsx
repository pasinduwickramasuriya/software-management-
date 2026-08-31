import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Code,
  CheckCircle2,
  Clock,
  PlayCircle,
  CheckCheck,
  Building2,
  FileText,
  Search,
  Eye,
  XCircle,
  Briefcase,
} from 'lucide-react';

export default function DeveloperDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'completed', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('projects/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch developer tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await API.patch(`projects/tasks/${taskId}/update-status/`, {
        status: newStatus,
      });
      fetchMyTasks();
    } catch (err) {
      alert('Failed to update task status: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
            <Clock size={12} /> Not Started
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
            <Code size={12} /> In Progress
          </span>
        );
      case 'Completed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
            <CheckCheck size={12} /> Completed
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

  const filteredTasks = tasks.filter((t) => {
    if (filterTab === 'active' && t.status === 'Completed') return false;
    if (filterTab === 'completed' && t.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.task_title?.toLowerCase().includes(q);
      const matchProject = t.ticket_name?.toLowerCase().includes(q);
      const matchBranch = t.branch_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchProject && !matchBranch) {
        return false;
      }
    }
    return true;
  });

  const notStartedCount = tasks.filter((t) => t.status === 'Not Started').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase size={28} color="#2563eb" /> Developer Workspace
        </h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Track and execute development tasks assigned to you by the IT Main Developer.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ ...statCardStyle, borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600 }}>Total Assigned Tasks</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{tasks.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned to your queue</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600 }}>Not Started</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#b45309' }}>{notStartedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready to be picked up</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>In Progress</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d4ed8' }}>{inProgressCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Currently working on</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>Completed</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#15803d' }}>{completedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivered & tested</span>
        </div>
      </div>

      {/* Main Tasks Table / Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Header Tabs & Search */}
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
              onClick={() => setFilterTab('active')}
              style={{
                ...tabBtnStyle,
                backgroundColor: filterTab === 'active' ? '#2563eb' : '#ffffff',
                color: filterTab === 'active' ? '#ffffff' : '#475569',
                borderColor: filterTab === 'active' ? '#2563eb' : '#cbd5e1',
              }}
            >
              ⚡ Active Tasks ({notStartedCount + inProgressCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              style={{
                ...tabBtnStyle,
                backgroundColor: filterTab === 'completed' ? '#2563eb' : '#ffffff',
                color: filterTab === 'completed' ? '#ffffff' : '#475569',
                borderColor: filterTab === 'completed' ? '#2563eb' : '#cbd5e1',
              }}
            >
              ✅ Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              style={{
                ...tabBtnStyle,
                backgroundColor: filterTab === 'all' ? '#2563eb' : '#ffffff',
                color: filterTab === 'all' ? '#ffffff' : '#475569',
                borderColor: filterTab === 'all' ? '#2563eb' : '#cbd5e1',
              }}
            >
              📑 All Tasks ({tasks.length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Search task or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...inputStyle,
                width: '240px',
                paddingLeft: '32px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading your tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {filterTab === 'active'
              ? '🎉 All caught up! No active tasks assigned to you right now.'
              : 'No tasks found.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTasks.map((t) => (
              <div
                key={t.task_id}
                style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                  backgroundColor: t.status === 'In Progress' ? '#faf5ff' : '#ffffff',
                }}
              >
                {/* Left Task Info */}
                <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{t.task_title}</span>
                    {getStatusBadge(t.status)}
                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Building2 size={11} /> {t.branch_name || 'Organization'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Project: <strong style={{ color: '#1e293b' }}>{t.ticket_name}</strong> (Ticket #{t.ticket})
                  </div>

                  {t.description && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.4 }}>
                      {t.description}
                    </p>
                  )}

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Assigned Date: {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* View Full Requirements */}
                  <button onClick={() => setViewingTask(t)} style={iconBtnStyle} title="View Details">
                    <Eye size={14} /> Details
                  </button>

                  {/* Start Task Button */}
                  {t.status === 'Not Started' && (
                    <button
                      onClick={() => handleUpdateStatus(t.task_id, 'In Progress')}
                      disabled={updatingTaskId === t.task_id}
                      style={{
                        ...iconBtnStyle,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                        fontWeight: 600,
                      }}
                      title="Start working on this task"
                    >
                      <PlayCircle size={14} /> Start Task
                    </button>
                  )}

                  {/* Mark Completed Button */}
                  {t.status !== 'Completed' && (
                    <button
                      onClick={() => handleUpdateStatus(t.task_id, 'Completed')}
                      disabled={updatingTaskId === t.task_id}
                      style={{
                        ...iconBtnStyle,
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        borderColor: '#16a34a',
                        fontWeight: 600,
                      }}
                      title="Mark task as completed"
                    >
                      <CheckCircle2 size={14} /> Mark Completed
                    </button>
                  )}

                  {/* Reopen Task Button */}
                  {t.status === 'Completed' && (
                    <button
                      onClick={() => handleUpdateStatus(t.task_id, 'In Progress')}
                      disabled={updatingTaskId === t.task_id}
                      style={{
                        ...iconBtnStyle,
                        color: '#475569',
                        borderColor: '#cbd5e1',
                      }}
                      title="Reopen Task"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW TASK & SPECS MODAL */}
      {viewingTask && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '600px' }}>
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
                <h3 style={{ margin: 0 }}>Task #{viewingTask.task_id} Details</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Project: <strong>{viewingTask.ticket_name}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewingTask(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <strong>Task Title:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 600 }}>
                  {viewingTask.task_title}
                </p>
              </div>

              <div>
                <strong>Current Status:</strong>
                <div style={{ marginTop: '4px' }}>{getStatusBadge(viewingTask.status)}</div>
              </div>

              {viewingTask.description && (
                <div>
                  <strong>Task Instructions / Guidance:</strong>
                  <p
                    style={{
                      margin: '4px 0',
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem',
                    }}
                  >
                    {viewingTask.description}
                  </p>
                </div>
              )}

              {viewingTask.ticket_requirements && (
                <div>
                  <strong>Overall Project Requirements:</strong>
                  <p
                    style={{
                      margin: '4px 0',
                      background: '#f1f5f9',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      whiteSpace: 'pre-wrap',
                      color: '#334155',
                    }}
                  >
                    {viewingTask.ticket_requirements}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingTask(null)} style={secondaryBtnStyle}>
                Close
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
