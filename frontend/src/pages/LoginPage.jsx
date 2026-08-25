import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left: big bold headline */}
        <div style={styles.leftCol}>
          <h1 style={styles.headline}>
            Software
            <br />
            Management
            <br />
            System
          </h1>
          <p style={styles.subheadline}>
            Sign in to access your branch workflow
            <br />
            and projects.
          </p>
        </div>

        {/* Right: login form card */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Sign in</h2>
            <p style={styles.cardSubtitle}>Use your branch-assigned credentials</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <User size={14} style={{ marginRight: 6 }} /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <KeyRound size={14} style={{ marginRight: 6 }} /> Password
                </label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...styles.input, paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeBtn}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.rowBetween}>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" style={styles.checkbox} defaultChecked />
                  Keep me signed in
                </label>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                <LogIn size={17} style={{ marginRight: 8 }} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={styles.footerNote}>Access is provisioned by the System Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Google Sans', Arial, Helvetica, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '64px',
    width: '100%',
    maxWidth: '1240px',
  },
  leftCol: {
    flex: '1 1 420px',
    minWidth: '320px',
  },
  headline: {
    fontSize: 'clamp(2.4rem, 5vw, 4.25rem)',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-1.5px',
    lineHeight: 1.08,
    margin: '0 0 24px 0',
  },
  subheadline: {
    fontSize: '1.125rem',
    fontWeight: 400,
    color: '#475569',
    lineHeight: 1.5,
    margin: 0,
  },
  rightCol: {
    flex: '0 1 470px',
    minWidth: '320px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 24px -8px rgba(15, 23, 42, 0.07)',
    padding: '48px',
    width: '100%',
    boxSizing: 'border-box',
  },
  cardTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 24px 0',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#64748b',
  },
  rowBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: 400,
    color: '#64748b',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#2563eb',
  },
  submitBtn: {
    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
    color: '#ffffff',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4px',
    fontFamily: 'inherit',
  },
  footerNote: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'center',
    margin: '20px 0 0 0',
  },
};
