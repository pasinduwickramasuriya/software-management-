import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Code,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Users,
  Eye,
  CheckCheck,
  Building2,
  FileText,
  Search,
  Filter,
  Trash2,
  Layers,
  XCircle,
} from 'lucide-react';

export default function ITMainDeveloperDashboard() {
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [assigningProject, setAssigningProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [managingProjectTasks, setManagingProjectTasks] = useState(null);

  // Assign Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchDevelopers();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('projects/');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await API.get('auth/developers/');
      setDevelopers(res.data);
      if (res.data.length > 0) {
        setAssignedTo(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch developers', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert('Please enter a task title.');
      return;
    }
    if (!assignedTo) {
      alert('Please select a developer.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('projects/tasks/', {
        ticket: assigningProject.ticket,
        assigned_to: assignedTo,
        task_title: taskTitle,
        description: taskDescription,
      });
      alert('Task successfully assigned to developer!');
      setAssigningProject(null);
      setTaskTitle('');
      setTaskDescription('');
      fetchProjects();
    } catch (err) {
      alert('Failed to assign task: ' + (err.response?.data?.detail || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`projects/tasks/${taskId}/`);
      fetchProjects();
      if (managingProjectTasks) {
        // Refresh modal data
        const updated = await API.get(`projects/${managingProjectTasks.project_id}/`);
        setManagingProjectTasks(updated.data);
      }
    } catch (err) {
      alert('Failed to delete task: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleMarkProjectComplete = async (projectId) => {
    if (
      !window.confirm(
        'Mark this project as COMPLETED? This will close the project and update the branch ticket status to Completed.'
      )
    ) {
      return;
    }
    try {
      await API.post(`projects/${projectId}/mark-completed/`);
      alert('Project and ticket marked as Completed!');
      fetchProjects();
    } catch (err) {
      alert('Failed to complete project: ' + (err.response?.data?.detail || 'Unknown error'));
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

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.project_name?.toLowerCase().includes(q);
      const matchBranch = p.branch_name?.toLowerCase().includes(q);
      const matchId = p.project_id?.toString().includes(q);
      if (!matchName && !matchBranch && !matchId) {
        return false;
      }
    }
    return true;
  });

  const notStartedCount = projects.filter((p) => p.status === 'Not Started').length;
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.total_tasks || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.completed_tasks || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={28} color="#2563eb" /> IT Main Developer Project & Task Management
        </h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Assign tickets and tasks to developers, supervise progress, and close completed software projects.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ ...statCardStyle, borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600 }}>Total Projects</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{projects.length}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized by IT Director</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600 }}>Not Started</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#b45309' }}>{notStartedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting task assignments</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>In Progress</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d4ed8' }}>{inProgressCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Under active development</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>Completed Projects</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#15803d' }}>{completedCount}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Closed & delivered</span>
        </div>

        <div style={{ ...statCardStyle, borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ color: '#6d28d9', fontSize: '0.85rem', fontWeight: 600 }}>Overall Tasks</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6d28d9' }}>
            {completedTasks} / {totalTasks}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tasks completed by developers</span>
        </div>
      </div>

      {/* Projects Table Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Filter bar */}
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
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'Not Started', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  ...tabBtnStyle,
                  backgroundColor: statusFilter === st ? '#2563eb' : '#ffffff',
                  color: statusFilter === st ? '#ffffff' : '#475569',
                  borderColor: statusFilter === st ? '#2563eb' : '#cbd5e1',
                }}
              >
                {st === 'all' ? 'All Projects' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder="Search project name, branch..."
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

        {/* Project List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No authorized projects found. Projects will appear here once approved by the IT Director.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px' }}>Project ID</th>
                <th style={{ padding: '12px 16px' }}>Branch</th>
                <th style={{ padding: '12px 16px' }}>Project Name</th>
                <th style={{ padding: '12px 16px' }}>Task Progress</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.project_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>
                    #{p.project_id} (Ticket #{p.ticket})
                  </td>
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
                      <Building2 size={12} /> {p.branch_name || 'Organization'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{p.project_name}</td>
                  <td style={{ padding: '12px 16px', width: '220px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: '#475569' }}>
                          {p.completed_tasks} / {p.total_tasks} Tasks Done
                        </span>
                        <span style={{ fontWeight: 600, color: p.progress_percentage === 100 ? '#16a34a' : '#2563eb' }}>
                          {p.progress_percentage}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${p.progress_percentage}%`,
                            height: '100%',
                            backgroundColor: p.progress_percentage === 100 ? '#16a34a' : '#2563eb',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{getStatusBadge(p.status)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                      {/* View Specs */}
                      <button onClick={() => setViewingProject(p)} style={iconBtnStyle} title="View Specs">
                        <Eye size={14} /> Specs
                      </button>

                      {/* Manage / View Tasks */}
                      <button
                        onClick={() => setManagingProjectTasks(p)}
                        style={{ ...iconBtnStyle, color: '#4f46e5', borderColor: '#c7d2fe' }}
                        title="Manage Tasks"
                      >
                        <Users size={14} /> Tasks ({p.total_tasks})
                      </button>

                      {/* Assign Task Button */}
                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            setAssigningProject(p);
                            setTaskTitle('');
                            setTaskDescription('');
                          }}
                          style={{ ...iconBtnStyle, color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                          title="Assign New Task to Developer"
                        >
                          <Plus size={14} /> Assign Task
                        </button>
                      )}

                      {/* Complete & Close Project */}
                      {p.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkProjectComplete(p.project_id)}
                          style={{
                            ...iconBtnStyle,
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            borderColor: '#16a34a',
                            fontWeight: 600,
                          }}
                          title="Complete & Close Project"
                        >
                          <CheckCheck size={14} /> Complete & Close
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

      {/* ASSIGN TASK MODAL */}
      {assigningProject && (
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
                <h3 style={{ margin: 0, color: '#0f172a' }}>Assign Task to Developer</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Project: <strong>{assigningProject.project_name}</strong> (#{assigningProject.project_id})
                </span>
              </div>
              <button
                onClick={() => setAssigningProject(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              {/* Select Developer */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Assign To Developer</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                  style={inputStyle}
                >
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      👨‍💻 {dev.username} ({dev.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build REST API for Food Menu"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Task Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Task Instructions & Description</label>
                <textarea
                  placeholder="Provide technical guidance, acceptance criteria, or API design specs..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={4}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setAssigningProject(null)} style={secondaryBtnStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={primaryBtnStyle}>
                  {submitting ? 'Assigning...' : 'Confirm Task Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PROJECT TASKS MODAL */}
      {managingProjectTasks && (
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
                <h3 style={{ margin: 0 }}>Project Tasks: {managingProjectTasks.project_name}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Total Tasks: <strong>{managingProjectTasks.tasks?.length || 0}</strong>
                </span>
              </div>
              <button
                onClick={() => setManagingProjectTasks(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {managingProjectTasks.tasks && managingProjectTasks.tasks.length > 0 ? (
                managingProjectTasks.tasks.map((t) => (
                  <div
                    key={t.task_id}
                    style={{
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.task_title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        Assigned to: <strong>{t.assigned_to_name}</strong>
                      </div>
                      {t.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#475569' }}>{t.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(t.status)}
                      <button
                        onClick={() => handleDeleteTask(t.task_id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No tasks assigned to this project yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setAssigningProject(managingProjectTasks);
                  setManagingProjectTasks(null);
                }}
                style={{ ...primaryBtnStyle, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Another Task
              </button>
              <button onClick={() => setManagingProjectTasks(null)} style={secondaryBtnStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROJECT SPECS MODAL */}
      {viewingProject && (
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
                <h3 style={{ margin: 0 }}>Project #{viewingProject.project_id} Specifications</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Branch: <strong>{viewingProject.branch_name}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewingProject(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Project Name:</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>
                  {viewingProject.project_name}
                </p>
              </div>

              <div>
                <strong>Ticket Requirements:</strong>
                <p
                  style={{
                    margin: '4px 0',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                  }}
                >
                  {viewingProject.ticket_details?.requirements || 'No description provided'}
                </p>
              </div>

              {viewingProject.ticket_details?.documents && viewingProject.ticket_details.documents.length > 0 && (
                <div>
                  <strong>Attached Specification Documents:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {viewingProject.ticket_details.documents.map((doc, idx) => (
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewingProject(null)} style={secondaryBtnStyle}>
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
