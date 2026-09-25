


import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left column: Showcase card */}
        <div style={styles.leftCol}>
          <div style={styles.showcaseCard}>
            <div style={styles.cardHeader}>
              <div style={styles.logoBlock}>
                {/* Google-scale hero emblem container */}
                <div style={styles.logoCircle}>
                  <img
                    src="/emblem.svg"
                    alt="SMS Logo"
                    style={styles.logo}
                  />
                </div>
                <div style={styles.brandTitleWrap}>
                  <span style={styles.brandTitle}>Software Management System</span>
                  <span style={styles.brandSubtitle}>Central Authentication Gateway</span>
                </div>
              </div>
            </div>

            <div style={styles.quoteBlock}>
              <h1 style={styles.headline}>
                “Streamlining branch workflows and software operations across every team.”
              </h1>
              <p style={styles.subheadline}>
                Sign in to manage projects, verify builds, and oversee deployment activity.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Login form card */}
        <div style={styles.rightCol}>
          <div style={styles.loginCard}>
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
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Keep me signed in
                </label>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <span style={styles.circleArrow}>
                  <ArrowRight size={16} />
                </span>
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
    fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(16px, 3vw, 40px)',
    boxSizing: 'border-box',
    color: '#1f1f1f',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 'clamp(16px, 3vw, 32px)',
    width: '100%',
    maxWidth: '1180px',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 340px',
    minWidth: '280px',
    maxWidth: '100%',
    display: 'flex',
  },
  showcaseCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 'clamp(20px, 3vw, 40px)',
    padding: 'clamp(24px, 4.5vw, 52px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    boxShadow: 'none',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logoBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
  },
  logoCircle: {
    width: 'clamp(64px, 8vw, 96px)',
    height: 'clamp(64px, 8vw, 96px)',
    borderRadius: 'clamp(18px, 2.5vw, 28px)',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  logo: {
    width: 'clamp(44px, 6vw, 64px)',
    height: 'clamp(44px, 6vw, 64px)',
    objectFit: 'contain',
    display: 'block',
  },
  brandTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  brandTitle: {
    fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
    fontWeight: 700,
    color: '#1f1f1f',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: 'clamp(0.78rem, 1.5vw, 0.875rem)',
    fontWeight: 500,
    color: '#0b57d0',
    letterSpacing: '0.2px',
  },
  quoteBlock: {
    marginTop: 'clamp(24px, 4vw, 48px)',
  },
  headline: {
    fontSize: 'clamp(1.35rem, 2.8vw, 2.2rem)',
    fontWeight: 500,
    color: '#1f1f1f',
    lineHeight: 1.28,
    margin: '0 0 14px 0',
    letterSpacing: '-0.4px',
  },
  subheadline: {
    fontSize: 'clamp(0.85rem, 1.4vw, 1rem)',
    color: '#5f6368',
    lineHeight: 1.6,
    margin: 0,
  },
  rightCol: {
    flex: '1 1 320px',
    minWidth: '280px',
    maxWidth: '100%',
    display: 'flex',
  },
  loginCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 'clamp(20px, 3vw, 40px)',
    border: 'none',
    boxShadow: 'none',
    padding: 'clamp(24px, 4vw, 44px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  cardTitle: {
    fontSize: 'clamp(1.35rem, 2.2vw, 1.65rem)',
    fontWeight: 600,
    color: '#1f1f1f',
    margin: '0 0 8px 0',
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    color: '#5f6368',
    margin: '0 0 24px 0',
  },
  errorBox: {
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    border: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#444746',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: '#edf2f7',
    color: '#1f1f1f',
    fontSize: '0.95rem',
    outline: 'none',
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
    color: '#747775',
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
    fontSize: '0.85rem',
    color: '#5f6368',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'rgb(37,99,235)',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: 'rgb(37,99,235)',
    color: '#ffffff',
    padding: '8px 10px 8px 24px',
    borderRadius: '999px',
    border: 'none',
    boxShadow: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontFamily: 'inherit',
  },
  circleArrow: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    color: 'rgb(37,99,235)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    fontSize: '0.75rem',
    color: '#8e918f',
    textAlign: 'center',
    margin: '28px 0 0 0',
  },
};