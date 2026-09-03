import React from 'react';
import { LayoutDashboard, Shield, ChevronRight } from 'lucide-react';
import DashboardPage from '../pages/it-director/DashboardPage';
import ProfileMenu from './ProfileMenu';

export default function ITDirectorLayout() {
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
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              IT Director Portal
            </span>
          </div>
        </div>

        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={activeNavItemStyle}>
            <LayoutDashboard size={18} />
            Dashboard Console
          </button>
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
            <span style={{ color: '#64748b' }}>Home</span>
            <ChevronRight size={14} color="#cbd5e1" />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Director Dashboard</span>
          </div>

          <ProfileMenu />
        </header>

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <DashboardPage />
          </div>
        </main>
      </div>

    </div>
  );
}

const activeNavItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
};
