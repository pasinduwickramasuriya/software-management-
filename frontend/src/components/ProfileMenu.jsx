import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, role, branch, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button onClick={() => setOpen((p) => !p)} style={profileButtonStyle}>
        <span style={avatarCircleStyle}>
          <User size={16} color="#2563eb" />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{user?.username}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{branch || role}</span>
        </span>
        <ChevronDown size={16} color="#64748b" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div style={dropdownHeaderStyle}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{user?.username}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{role}</p>
          </div>
          <button
            style={{ ...dropdownItemStyle, color: '#dc2626' }}
            onClick={() => { setOpen(false); logout(); }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

const profileButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '10px', padding: '6px 12px 6px 6px', cursor: 'pointer',
};

const avatarCircleStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: '50%',
  backgroundColor: '#dbeafe',
};

const dropdownStyle = {
  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
  width: '200px', backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0', borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', zIndex: 50,
};

const dropdownHeaderStyle = {
  padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
};

const dropdownItemStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '10px 16px', border: 'none', background: 'none',
  color: '#334155', fontSize: '0.85rem', fontWeight: 500,
  cursor: 'pointer', textAlign: 'left',
};