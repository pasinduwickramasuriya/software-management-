import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Building2, User, KeyRound } from 'lucide-react';

const DEMO_USERS = [
  { label: 'Branch Manager (Food)', username: 'bm_food', role: 'Branch Manager', branch: 'Food Branch' },
  { label: 'Executive Officer (Food)', username: 'eo_food', role: 'Executive Officer', branch: 'Food Branch' },
  { label: 'IT Director', username: 'it_director', role: 'IT Director', branch: 'ICT Branch' },
  { label: 'IT Main Developer', username: 'it_main_dev', role: 'IT Main Dev', branch: 'ICT Branch' },
  { label: 'Developer (Alice)', username: 'dev_alice', role: 'Developer', branch: 'ICT Branch' },
  { label: 'System Admin', username: 'admin_user', role: 'Admin', branch: 'System' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername) => {
    setUsername(demoUsername);
    setPassword('password123');
    setError('');
    setLoading(true);
    login(demoUsername, 'password123')
      .catch((err) => {
        setError(err.response?.data?.detail || 'Demo login failed.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <ShieldCheck size={32} color="#2563eb" />
          </div>
          <h2 style={styles.title}>Software Management System</h2>
          <p style={styles.subtitle}>Sign in to access your branch workflow & projects</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <User size={16} style={{ marginRight: 6 }} /> Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. bm_food, eo_food, it_director"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <KeyRound size={16} style={{ marginRight: 6 }} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            <LogIn size={18} style={{ marginRight: 8 }} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>⚡ Quick 1-Click Demo Login:</p>
          <div style={styles.demoGrid}>
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.username}
                type="button"
                onClick={() => handleDemoLogin(demo.username)}
                style={styles.demoBtn}
              >
                <div style={styles.demoRole}>{demo.label}</div>
                <div style={styles.demoBranch}>
                  <Building2 size={12} style={{ marginRight: 3 }} /> {demo.branch}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '36px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px auto',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4px',
  },
  demoSection: {
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  demoTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 12px 0',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  demoBtn: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  demoRole: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  demoBranch: {
    fontSize: '0.72rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
};
