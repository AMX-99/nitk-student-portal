import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nitk-user'));
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('nitk-token'));
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const role = user?.user_metadata?.role || null;

  // Fetch profile based on role
  const fetchProfile = useCallback(async () => {
    if (!token || !role) { setProfile(null); return; }
    try {
      if (role === 'student') {
        const { data } = await api.get('/students/me');
        setProfile(data.data);
      } else if (role === 'teacher') {
        const { data } = await api.get('/teachers/me');
        setProfile(data.data);
      } else if (role === 'admin') {
        setProfile({ name: user?.user_metadata?.name || 'Admin', role: 'admin' });
      }
    } catch {
      setProfile(null);
    }
  }, [token, role, user]);

  // On mount — verify stored token
  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('nitk-user', JSON.stringify(data.user));
      } catch {
        // Token invalid
        setUser(null);
        setToken(null);
        localStorage.removeItem('nitk-token');
        localStorage.removeItem('nitk-refresh-token');
        localStorage.removeItem('nitk-user');
      }
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch profile when user changes
  useEffect(() => {
    if (user && token) fetchProfile();
  }, [user, token, fetchProfile]);

  // Listen for forced logout
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setToken(null);
      setProfile(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;
    if (accessToken) {
      localStorage.setItem('nitk-token', accessToken);
      if (refreshToken) localStorage.setItem('nitk-refresh-token', refreshToken);
      localStorage.setItem('nitk-user', JSON.stringify(data.user));
      setToken(accessToken);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('nitk-token');
    localStorage.removeItem('nitk-refresh-token');
    localStorage.removeItem('nitk-user');
    setUser(null);
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, profile, role, loading,
      isAuthenticated: !!token && !!user,
      login, logout, refetchProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
