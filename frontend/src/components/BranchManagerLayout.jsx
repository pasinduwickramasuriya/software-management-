import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, List, Shield, ChevronRight } from 'lucide-react';
import DashboardPage from '../pages/branch-manager/DashboardPage';
import CreateTicketPage from '../pages/branch-manager/CreateTicketPage';
import ViewTicketsPage from '../pages/branch-manager/ViewTicketsPage';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../context/AuthContext';

export default function BranchManagerLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const { role } = useAuth();

  const breadcrumbLabel = { dashboard: 'Dashboard', create: 'Create Ticket', view: 'View Tickets' }[activePage] || 'Dashboard';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} />;
      case 'create':
        return <CreateTicketPage setActivePage={setActivePage} />;
      case 'view':
        return <ViewTicketsPage />;
      default:
        return <DashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={24} color="#2563eb" />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Software<br/>Management<br/>System</span>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActivePage('dashboard')}
            style={activePage === 'dashboard' ? activeNavItemStyle : navItemStyle}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActivePage('create')}
            style={activePage === 'create' ? activeNavItemStyle : navItemStyle}
          >
            <PlusCircle size={18} />
            Create Ticket
          </button>
          
          <button 
            onClick={() => setActivePage('view')}
            style={activePage === 'view' ? activeNavItemStyle : navItemStyle}
          >
            <List size={18} />
            View Tickets
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      {/* Right side: header + page content */}
<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
  <header style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px',
    padding: '16px 32px 16px 0', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
  }}>
    {/* Breadcrumbs */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', whiteSpace: 'nowrap', padding: '0 24px' }}>
      <span style={{ color: '#020202' }}>Home</span>
      <ChevronRight size={14} color="#cbd5e1" />
      <span style={{ color: '#0f172a', fontWeight: 600 }}>{breadcrumbLabel}</span>
    </div>

    <ProfileMenu />
  </header>

  <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
  padding: '12px 16px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  color: '#64748b',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
};

const activeNavItemStyle = {
  ...navItemStyle,
  backgroundColor: '#2563eb',
  color: '#ffffff',
};
