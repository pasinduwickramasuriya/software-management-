import React, { useState } from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../context/AuthContext';

// Branch Manager pages
import BMDashboardPage from '../pages/branch-manager/DashboardPage';
import BMCreateTicketPage from '../pages/branch-manager/CreateTicketPage';
import BMViewTicketsPage from '../pages/branch-manager/ViewTicketsPage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminBranchesPage from '../pages/admin/AdminBranchesPage';
import AdminTicketsPage from '../pages/admin/AdminTicketsPage';
import AdminProjectsPage from '../pages/admin/AdminProjectsPage';

// IT Director page
import ITDirectorDashboard from '../pages/it-director/DashboardPage';

// Executive Officer page
import ExecutiveOfficerDashboard from '../pages/ExecutiveOfficerDashboard';

// IT Main Developer page
import ITMainDeveloperDashboard from './ITMainDeveloperDashboard';

// Developer page
import DeveloperDashboard from './DeveloperDashboard';

function resolveRoleKey(role) {
  if (!role) return null;

  const r = role.toLowerCase();

  if (r.includes('admin')) return 'admin';
  if (r.includes('branch manager')) return 'branch_manager';
  if (r.includes('executive')) return 'executive_officer';
  if (r.includes('director')) return 'it_director';
  if (r.includes('main developer') || r.includes('main dev')) {
    return 'it_main_developer';
  }
  if (r === 'developer') return 'developer';

  return null;
}

const ROLE_CONFIG = {
  branch_manager: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: BMDashboardPage,
      },
      {
        key: 'create',
        label: 'Create Ticket',
        component: BMCreateTicketPage,
      },
      {
        key: 'view',
        label: 'View Tickets',
        component: BMViewTicketsPage,
      },
    ],
  },

  admin: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: AdminDashboard,
      },
      {
        key: 'users',
        label: 'Users',
        component: AdminUsersPage,
      },
      {
        key: 'branches',
        label: 'Branches',
        component: AdminBranchesPage,
      },
      {
        key: 'tickets',
        label: 'Tickets',
        component: AdminTicketsPage,
      },
      {
        key: 'projects',
        label: 'Projects',
        component: AdminProjectsPage,
      },
      {
        key: 'django_admin',
        label: 'Django Admin',
        external: 'http://127.0.0.1:8000/admin/',
      },
    ],
  },

  it_director: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: ITDirectorDashboard,
      },
    ],
  },

  executive_officer: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: ExecutiveOfficerDashboard,
      },
    ],
  },

  it_main_developer: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: ITMainDeveloperDashboard,
      },
    ],
  },

  developer: {
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        component: DeveloperDashboard,
      },
    ],
  },
};

export default function MainLayout() {
  const { role } = useAuth();

  const roleKey = resolveRoleKey(role);
  const config = ROLE_CONFIG[roleKey];

  const [activePage, setActivePage] = useState(config?.default);

  if (!config) {
    return (
      <div style={{ padding: 32 }}>
        Unrecognized role: {String(role)}
      </div>
    );
  }

  const pageItems = config.items.filter((i) => !i.external);

  const activeItem =
    pageItems.find((i) => i.key === activePage) || pageItems[0];

  const ActiveComponent = activeItem.component;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 32px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={18} color="#ffffff" />
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '0.3px',
              }}
            >
              SMS
            </div>

            <div
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              software management system
            </div>
          </div>
        </div>

        {/* Navigation + Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <nav
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '4px',
            }}
          >
            {config.items.map((item) => {
              // External link - Django Admin
              if (item.external) {
                return (
                  <a
                    key={item.key}
                    href={item.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...pillStyle,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                    <ExternalLink size={12} />
                  </a>
                );
              }

              // Normal navigation button
              return (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  style={
                    activePage === item.key
                      ? activePillStyle
                      : pillStyle
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <ProfileMenu />
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: '32px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <ActiveComponent setActivePage={setActivePage} />
        </div>
      </main>
    </div>
  );
}

// Navigation pill style
const pillStyle = {
  padding: '8px 18px',
  borderRadius: '16px',
  border: 'none',
  background: 'none',
  color: '#64748b',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};

// Active navigation pill style
const activePillStyle = {
  ...pillStyle,
  backgroundColor: '#2563eb',
  color: '#ffffff',
};