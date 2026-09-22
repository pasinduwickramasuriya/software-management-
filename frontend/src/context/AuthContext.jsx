import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AuthContext = createContext(null);

// Unticked "Keep me signed in" sessions expire after this time (8 hours)
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000;

// Read a value from either storage
const getStored = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

// Remove everything from both storages
const clearStored = () => {
  ['token', 'user', 'login_time'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// If the login was NOT "remembered" and is too old, wipe it
const clearIfExpired = () => {
  const loginTime = sessionStorage.getItem('login_time');
  if (loginTime && Date.now() - Number(loginTime) > SESSION_MAX_AGE) {
    clearStored();
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    clearIfExpired();
    const saved = getStored('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearIfExpired();
    const token = getStored('token');

    if (token) {
      API.get('auth/me/')
        .then((res) => {
          setUser(res.data);
          const storage = localStorage.getItem('token')
            ? localStorage
            : sessionStorage;
          storage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const login = async (username, password, rememberMe = false) => {
    const response = await API.post('auth/login/', {
      username,
      password,
    });

    const { token, user } = response.data;

    // Clear any old login first
    clearStored();

    // Ticked -> localStorage (stays after closing browser)
    // Unticked -> sessionStorage (cleared when browser/tab closes)
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));

    if (!rememberMe) {
      sessionStorage.setItem('login_time', String(Date.now()));
    }

    setUser(user);

    return user;
  };

  const logout = () => {
    API.post('auth/logout/').catch(() => {});

    clearStored();
    setUser(null);

    // Go back to login page
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.user_type,
        branch: user?.branch_name,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);