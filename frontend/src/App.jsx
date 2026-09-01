import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { Building2, User, LogOut, Shield } from 'lucide-react';
import './App.css';

import BranchManagerLayout from './components/BranchManagerLayout';
import ExecutiveOfficerDashboard from './components/ExecutiveOfficerDashboard';
import ITDirectorDashboard from './components/ITDirectorDashboard';
import ITMainDeveloperDashboard from './components/ITMainDeveloperDashboard';
import DeveloperDashboard from './components/DeveloperDashboard';

function MainLayout() {
  const { user, role, branch, logout, loading } = useAuth();

  const isBranchManager = role && role.toLowerCase().includes('branch manager');
  const isExecutiveOfficer = role && role.toLowerCase().includes('executive');
  const isITDirector = role && (role.toLowerCase().includes('director') || role.toLowerCase() === 'it director');
  const isITMainDev = role && (role.toLowerCase().includes('main developer') || role.toLowerCase().includes('main dev'));
  const isDeveloper = role && role.toLowerCase() === 'developer';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* If Branch Manager, render the new layout entirely (it has its own sidebar) */}
      {isBranchManager ? (
        <BranchManagerLayout />
      ) : (
        <>
          {/* Top Navbar for other roles */}
          <header style={headerStyles.navbar}>
            <div style={headerStyles.brand}>
              <Shield size={24} color="#2563eb" />
              <span style={headerStyles.brandName}>Software Management System</span>
            </div>

            <div style={headerStyles.userSection}>
              <div style={headerStyles.userInfo}>
                <span style={headerStyles.userName}>{user.username}</span>
                <div style={headerStyles.badgeRow}>
                  <span style={headerStyles.roleBadge}>{role || 'No Role'}</span>
                  {branch && (
                    <span style={headerStyles.branchBadge}>
                      <Building2 size={12} style={{ marginRight: 3 }} /> {branch}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={logout} style={headerStyles.logoutBtn}>
                <LogOut size={16} style={{ marginRight: 6 }} /> Logout
              </button>
            </div>
          </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        {isBranchManager ? (
          <BranchManagerDashboard />
        ) : isExecutiveOfficer ? (
          <ExecutiveOfficerDashboard />
        ) : (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2>Welcome, {user.username}!</h2>
            <p style={{ color: '#64748b' }}>
              You are logged in as <strong>{role}</strong> {branch ? `for ${branch}` : ''}.
            </p>
            <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#1e40af', marginTop: '16px' }}>
              🎉 <strong>Logged in as {role}!</strong>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

const headerStyles = {
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '2px',
  },
  roleBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  branchBadge: {
    fontSize: '0.72rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
};
