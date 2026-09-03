import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Building2,
  PlusCircle,
  XCircle,
  Search,
} from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await API.get('auth/branches/');
      setBranches(res.data || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    setSubmitting(true);
    try {
      await API.post('auth/branches/', { branch_name: branchName.trim() });
      alert(`Branch "${branchName}" registered successfully!`);
      setBranchName('');
      setShowAddModal(false);
      fetchBranches();
    } catch (err) {
      alert('Failed to create branch: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBranches = branches.filter((b) =>
    b.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={24} color="#0891b2" /> Organizational Branch Management
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Manage banking / corporate branch locations that submit software request tickets.
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} style={actionBtnBlue}>
            <PlusCircle size={16} style={{ marginRight: '6px' }} />
            Add New Branch
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '20px', maxWidth: '320px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search branches..."
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

      {/* Branches Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            Registered Branches ({filteredBranches.length})
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading branches...</div>
        ) : filteredBranches.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No branches match the search query.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={thStyle}>Branch ID</th>
                  <th style={thStyle}>Branch Name</th>
                  <th style={thStyle}>System Identifier</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((b) => (
                  <tr key={b.bid} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b' }}>#{b.bid}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1e293b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#0891b2" />
                        {b.branch_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>BR-{String(b.bid).padStart(3, '0')}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BRANCH MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Register New Branch</h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Colombo City Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  style={inputStyleFull}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={actionBtnNeutral}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={actionBtnBlue}>
                  {submitting ? 'Registering...' : 'Register Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

const actionBtnBlue = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: '1px solid #2563eb',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const actionBtnNeutral = {
  backgroundColor: '#f8fafc',
  color: '#475569',
  border: '1px solid #e2e8f0',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
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

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: '6px',
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
  maxWidth: '460px',
  padding: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
