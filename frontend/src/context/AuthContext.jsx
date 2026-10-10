import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pspl_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pspl_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify stored session on app mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('pspl_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('pspl_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('pspl_token', res.token);
      localStorage.setItem('pspl_user', JSON.stringify(res.user));
      return res.user;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pspl_token');
    localStorage.removeItem('pspl_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
