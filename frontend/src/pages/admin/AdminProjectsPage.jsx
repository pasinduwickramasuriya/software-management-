import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await API.get('projects/');
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
            <Clock size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
            {status || 'Not Started'}
          </span>
        );
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ticket?.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={24} color="#16a34a" /> Approved Development Projects
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Overview of authorized IT development projects and team progress.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...inputStyleFull,
                paddingLeft: '36px',
                paddingTop: '8px',
                paddingBottom: '8px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Projects Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            Active & Completed Projects ({filteredProjects.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No projects found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={thStyle}>Project ID</th>
                  <th style={thStyle}>Ticket Source</th>
                  <th style={thStyle}>Project Title</th>
                  <th style={thStyle}>Assigned Developers</th>
                  <th style={thStyle}>Created Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.project_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#16a34a' }}>#PRJ-{p.project_id}</td>
                    <td style={{ padding: '16px 24px', color: '#3b82f6', fontWeight: 600 }}>
                      #TK-{p.ticket?.ticket_id || p.ticket}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>{p.project_name}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {p.assigned_developers && p.assigned_developers.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.assigned_developers.map((d, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                              <User size={10} /> {d.username || d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      {p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '-'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {getStatusBadge(p.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.5,
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
