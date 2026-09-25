import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { ExternalLink, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    basePath: '/branch-manager',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: BMDashboardPage,
      },
      {
        key: 'create',
        label: 'Create Ticket',
        path: 'create-ticket',
        component: BMCreateTicketPage,
      },
      {
        key: 'view',
        label: 'View Tickets',
        path: 'tickets',
        component: BMViewTicketsPage,
      },
    ],
  },

  admin: {
    basePath: '/admin',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: AdminDashboard,
      },
      {
        key: 'users',
        label: 'Users',
        path: 'users',
        component: AdminUsersPage,
      },
      {
        key: 'branches',
        label: 'Branches',
        path: 'branches',
        component: AdminBranchesPage,
      },
      {
        key: 'tickets',
        label: 'Tickets',
        path: 'tickets',
        component: AdminTicketsPage,
      },
      {
        key: 'projects',
        label: 'Projects',
        path: 'projects',
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
    basePath: '/it-director',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: ITDirectorDashboard,
      },
    ],
  },

  executive_officer: {
    basePath: '/executive',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: ExecutiveOfficerDashboard,
      },
    ],
  },

  it_main_developer: {
    basePath: '/it-main-developer',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: ITMainDeveloperDashboard,
      },
    ],
  },

  developer: {
    basePath: '/developer',
    default: 'dashboard',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: 'dashboard',
        component: DeveloperDashboard,
      },
    ],
  },
};

export default function MainLayout() {
  const { role, user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const roleKey = resolveRoleKey(role);
  const config = ROLE_CONFIG[roleKey];

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const [isReady, setIsReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef(null);
  const buttonRefs = useRef({});

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /*
   * Find the current page from the URL.
   */
  const activeItem =
    config?.items.find(
      (item) =>
        !item.external &&
        location.pathname === `${config.basePath}/${item.path}`
    ) ||
    config?.items.find((item) => !item.external && item.key === config.default);

  const activePage = activeItem?.key;

  /*
   * If the user enters the role URL without a page,
   * send them to the dashboard.
   */
  useEffect(() => {
    if (!config) return;

    const validPath = config.items.some(
      (item) =>
        item.external ||
        location.pathname === `${config.basePath}/${item.path}`
    );

    if (!validPath) {
      navigate(`${config.basePath}/${config.default}`, {
        replace: true,
      });
    }
  }, [config, location.pathname, navigate]);

  /*
   * Update the sliding navigation indicator.
   */
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

  const ActiveComponent = activeItem?.component;

  if (!ActiveComponent) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <header className="app-header">
        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`${config.basePath}/${config.default}`)}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src="/emblem.svg"
              alt="Sri Lanka Emblem"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <span className="brand-title">Software Management System</span>
            <span className="brand-title-short">SMS</span>
          </div>
        </div>

        {/* Navigation + Profile */}
        <div className="desktop-nav-container">
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
                    <ExternalLink
                      size={12}
                      className="external-icon"
                    />
                  </a>
                );
              }

              const isActive = activePage === item.key;

              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    buttonRefs.current[item.key] = el;
                  }}
                  onClick={() => {
                    navigate(`${config.basePath}/${item.path}`);
                  }}
                  className={`nav-pill-btn ${
                    isActive ? 'active' : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <ProfileMenu />

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Menu */}
      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/emblem.svg" alt="Emblem" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '1.05rem' }}>Navigation</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mobile-nav-links">
          {config.items.map((item) => {
            if (item.external) {
              return (
                <a
                  key={item.key}
                  href={item.external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <ExternalLink size={14} color="#64748b" />
                </a>
              );
            }

            const isActive = activePage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  navigate(`${config.basePath}/${item.path}`);
                  setMobileMenuOpen(false);
                }}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mobile-drawer-footer">
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Signed in as</div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{user?.username}</div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb', textTransform: 'capitalize', marginTop: '2px' }}>
            {role?.replace(/_/g, ' ')}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        <div className="app-content-container">
          <ActiveComponent
            setActivePage={(pageKey, filter) => {
              const item = config.items.find(
                (item) => item.key === pageKey
              );

              if (item && !item.external) {
                navigate(`${config.basePath}/${item.path}`, { state: { filter } });
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

