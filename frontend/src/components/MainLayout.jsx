import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

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
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [isReady, setIsReady] = useState(false);
  const navRef = useRef(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    if (config?.default && (!activePage || !config.items.some((i) => i.key === activePage))) {
      setActivePage(config.default);
    }
  }, [config, activePage]);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeEl = buttonRefs.current[activePage];
      if (activeEl && navRef.current) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          top: activeEl.offsetTop,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
          opacity: 1,
        });
      }
    };

    updateIndicator();
    const frameId = requestAnimationFrame(() => {
      setIsReady(true);
    });

    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activePage, config?.items]);

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
          position: 'sticky',
          top: 0,
          zIndex: 1000,
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
          <nav ref={navRef} className="nav-pill-group">
            {/* Smooth sliding active indicator */}
            <div
              className={`nav-pill-indicator ${isReady ? 'animated' : ''}`}
              style={{
                left: `${indicatorStyle.left}px`,
                top: `${indicatorStyle.top}px`,
                width: `${indicatorStyle.width}px`,
                height: `${indicatorStyle.height}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {config.items.map((item) => {
              // External link - Django Admin
              if (item.external) {
                return (
                  <a
                    key={item.key}
                    href={item.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-pill-external"
                  >
                    {item.label}
                    <ExternalLink size={12} className="external-icon" />
                  </a>
                );
              }

              // Normal navigation button
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    buttonRefs.current[item.key] = el;
                  }}
                  onClick={() => setActivePage(item.key)}
                  className={`nav-pill-btn ${isActive ? 'active' : ''}`}
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