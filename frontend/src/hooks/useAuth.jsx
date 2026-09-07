import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('seo_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err.message);
        localStorage.removeItem('seo_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('seo_token', token);
    setUser(user);
    return user;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authApi.register({ name, email, password, confirmPassword });
    const { token, user } = res.data;
    localStorage.setItem('seo_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('seo_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
