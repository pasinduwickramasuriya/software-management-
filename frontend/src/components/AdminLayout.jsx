import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Layers,
  Shield,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminBranchesPage from '../pages/admin/AdminBranchesPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';
import AdminProjectsPage from '../pages/admin/AdminProjectsPage';
import ProfileMenu from './ProfileMenu';

export default function AdminLayout() {
  const [activePage, setActivePage] = useState('dashboard');

  const breadcrumbLabels = {
    dashboard: 'Administrator Dashboard',
    users: 'User Account Management',
    branches: 'Branch Locations',
    tickets: 'System Tickets Audit',
    projects: 'Approved IT Projects',
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard setActivePage={setActivePage} />;
      case 'users':
        return <AdminUsersPage />;
      case 'branches':
        return <AdminBranchesPage />;
      case 'tickets':
        return <AdminTicketsPage />;
      case 'projects':
        return <AdminProjectsPage />;
      default:
        return <AdminDashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="#2563eb" />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Software<br />Management<br />System
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              Administrator Portal
            </span>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button
            onClick={() => setActivePage('dashboard')}
            style={activePage === 'dashboard' ? activeNavItemStyle : navItemStyle}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => setActivePage('users')}
            style={activePage === 'users' ? activeNavItemStyle : navItemStyle}
          >
            <Users size={18} />
            User Accounts
          </button>

          <button
            onClick={() => setActivePage('branches')}
            style={activePage === 'branches' ? activeNavItemStyle : navItemStyle}
          >
            <Building2 size={18} />
            Branches
          </button>

          <button
            onClick={() => setActivePage('tickets')}
            style={activePage === 'tickets' ? activeNavItemStyle : navItemStyle}
          >
            <FileText size={18} />
            All Tickets
          </button>

          <button
            onClick={() => setActivePage('projects')}
            style={activePage === 'projects' ? activeNavItemStyle : navItemStyle}
          >
            <Layers size={18} />
            Projects
          </button>

          <div style={{ margin: '16px 0', borderTop: '1px solid #f1f5f9' }} />

          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...navItemStyle,
              textDecoration: 'none',
              color: '#475569',
            }}
          >
            <ExternalLink size={18} />
            Django Admin
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px',
          padding: '16px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#64748b' }}>Admin</span>
            <ChevronRight size={14} color="#cbd5e1" />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{breadcrumbLabels[activePage] || 'Dashboard'}</span>
          </div>

          <ProfileMenu />
        </header>

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            {renderPage()}
          </div>
        </main>
      </div>

    </div>
  );
}

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  color: '#64748b',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
  width: '100%',
};

const activeNavItemStyle = {
  ...navItemStyle,
  backgroundColor: '#2563eb',
  color: '#ffffff',
};
