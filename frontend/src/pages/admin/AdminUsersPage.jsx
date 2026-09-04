import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  Shield,
  KeyRound,
  Pencil,
  Lock,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Create Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    type_id: '',
    branch: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id: null,
    username: '',
    email: '',
    type_id: '',
    branch: '',
    is_active: true,
  });

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        API.get('auth/users/'),
        API.get('auth/roles/').catch(() => ({ data: [] })),
        API.get('auth/branches/').catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setBranches(branchesRes.data || []);
    } catch (err) {
      console.error('Failed to load user management data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD: CREATE ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('auth/users/', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        type_id: formData.type_id ? parseInt(formData.type_id) : null,
        branch: formData.branch ? parseInt(formData.branch) : null,
      });
      alert(`User account "${formData.username}" created successfully!`);
      setShowAddModal(false);
      setFormData({ username: '', email: '', password: '', type_id: '', branch: '' });
      fetchUsersData();
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data || 'Failed to create user');
      alert('Error creating user: ' + detail);
    } finally {
      setSubmitting(false);
    }
  };

  // --- CRUD: UPDATE (EDIT USER DETAILS) ---
  const openEditModal = (u) => {
    setEditUserData({
      id: u.id,
      username: u.username || '',
      email: u.email || '',
      type_id: u.type_id || '',
      branch: u.branch || '',
      is_active: u.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        username: editUserData.username.trim(),
        email: editUserData.email.trim(),
        type_id: editUserData.type_id ? parseInt(editUserData.type_id) : null,
        branch: editUserData.branch ? parseInt(editUserData.branch) : null,
        is_active: editUserData.is_active,
      };
      const res = await API.patch(`auth/users/${editUserData.id}/`, payload);
      setUsers((prev) => prev.map((u) => (u.id === editUserData.id ? res.data : u)));
      alert(`User "${res.data.username}" updated successfully!`);
      setShowEditModal(false);
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data || 'Failed to update user');
      alert('Error updating user: ' + detail);
    } finally {
      setSubmitting(false);
    }
  };

  // --- CRUD: UPDATE (RESET / CHANGE PASSWORD) ---
  const openPasswordModal = (u) => {
    setPasswordTargetUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }
    setPasswordSubmitting(true);
    try {
      await API.patch(`auth/users/${passwordTargetUser.id}/`, {
        password: newPassword,
      });
      alert(`Password for "${passwordTargetUser.username}" changed successfully!`);
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data || 'Failed to change password');
      alert('Error changing password: ' + detail);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // --- CRUD: DELETE ---
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"?`)) {
      return;
    }
    try {
      await API.delete(`auth/users/${userId}/`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(`User "${username}" deleted.`);
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  // --- TOGGLE ACTIVE STATUS ---
  const handleToggleActive = async (userId, currentActive) => {
    try {
      const res = await API.patch(`auth/users/${userId}/`, { is_active: !currentActive });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u)));
    } catch (err) {
      alert('Failed to update user status: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.user_type !== roleFilter) return false;
    if (branchFilter !== 'all' && u.branch_name !== branchFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.username?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchRole = u.user_type?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header Card with Actions & Filters */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} color="#2563eb" /> System User Management
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Create, configure, update user profiles, change passwords, and manage role permissions for staff members.
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} style={actionBtnBlue}>
            <UserPlus size={16} style={{ marginRight: '6px' }} />
            Add New User
          </button>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by username or email..."
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

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} color="#64748b" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.type_id} value={r.user_type}>{r.user_type}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} color="#64748b" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.bid} value={b.branch_name}>{b.branch_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
            User Directory ({filteredUsers.length} accounts)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users match the selected criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Role / Type</th>
                  <th style={thStyle}>Assigned Branch</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#64748b' }}>#{u.id}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.username}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {u.user_type || (u.is_superuser ? 'Superuser' : 'No Role')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569' }}>
                      {u.branch_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                          <Building2 size={12} /> {u.branch_name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Global / IT Dept</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: u.is_active ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                        title="Click to toggle status"
                      >
                        {u.is_active ? (
                          <>
                            <CheckCircle size={14} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.8rem' }}>
                      {u.date_joined ? new Date(u.date_joined).toISOString().split('T')[0] : '-'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(u)}
                          style={actionBtnSecondary}
                          title="Edit user details"
                        >
                          <Pencil size={13} /> Edit
                        </button>

                        {/* Password Reset Button */}
                        <button
                          onClick={() => openPasswordModal(u)}
                          style={actionBtnKey}
                          title="Change user password"
                        >
                          <KeyRound size={13} /> Password
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          style={actionBtnDanger}
                          title="Delete user"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. CREATE NEW USER MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Provision New User Account</h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. john_manager"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={inputStyleFull}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@organization.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyleFull}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter secure initial password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={inputStyleFull}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>System Role</label>
                    <select
                      value={formData.type_id}
                      onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                      style={selectStyleFull}
                    >
                      <option value="">Select Role...</option>
                      {roles.map((r) => (
                        <option key={r.type_id} value={r.type_id}>{r.user_type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Branch Assignment</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      style={selectStyleFull}
                    >
                      <option value="">None (Global / IT Dept)</option>
                      {branches.map((b) => (
                        <option key={b.bid} value={b.bid}>{b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={actionBtnNeutral}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={actionBtnBlue}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT USER MODAL (CRUD UPDATE) */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="#2563eb" /> Edit User Account (#{editUserData.id})
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Username *</label>
                  <input
                    type="text"
                    required
                    value={editUserData.username}
                    onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                    style={inputStyleFull}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    style={inputStyleFull}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>System Role</label>
                    <select
                      value={editUserData.type_id || ''}
                      onChange={(e) => setEditUserData({ ...editUserData, type_id: e.target.value })}
                      style={selectStyleFull}
                    >
                      <option value="">No Role</option>
                      {roles.map((r) => (
                        <option key={r.type_id} value={r.type_id}>{r.user_type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Branch Assignment</label>
                    <select
                      value={editUserData.branch || ''}
                      onChange={(e) => setEditUserData({ ...editUserData, branch: e.target.value })}
                      style={selectStyleFull}
                    >
                      <option value="">None (Global / IT Dept)</option>
                      {branches.map((b) => (
                        <option key={b.bid} value={b.bid}>{b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={editUserData.is_active}
                      onChange={(e) => setEditUserData({ ...editUserData, is_active: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Account Active / Enabled
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={actionBtnNeutral}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={actionBtnBlue}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CHANGE / RESET PASSWORD MODAL */}
      {showPasswordModal && passwordTargetUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#d97706" /> Reset Password for "{passwordTargetUser.username}"
              </h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#64748b" />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.83rem' }}>
              Enter a new secure password for <strong>{passwordTargetUser.username}</strong> ({passwordTargetUser.email}).
            </p>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 4 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyleFull}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={labelStyle}>Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyleFull}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={actionBtnNeutral}>
                  Cancel
                </button>
                <button type="submit" disabled={passwordSubmitting} style={actionBtnAmber}>
                  {passwordSubmitting ? 'Updating Password...' : 'Update Password'}
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

const actionBtnAmber = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#d97706',
  color: '#ffffff',
  border: '1px solid #d97706',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const actionBtnSecondary = {
  backgroundColor: '#ffffff',
  color: '#2563eb',
  border: '1px solid #bfdbfe',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.78rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 500,
};

const actionBtnKey = {
  backgroundColor: '#ffffff',
  color: '#d97706',
  border: '1px solid #fed7aa',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.78rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 500,
};

const actionBtnDanger = {
  backgroundColor: '#ffffff',
  color: '#dc2626',
  border: '1px solid #fecaca',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.78rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 500,
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

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '0.85rem',
  color: '#334155',
  outline: 'none',
};

const selectStyleFull = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '0.88rem',
  color: '#334155',
  outline: 'none',
  boxSizing: 'border-box',
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
  maxWidth: '520px',
  padding: '24px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
