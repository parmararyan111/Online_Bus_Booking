import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bus_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('bus_token');
      const storedUser = localStorage.getItem('bus_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with server profile
          const data = await api.get('/auth/profile');
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('bus_user', JSON.stringify(data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('bus_token', data.token);
      localStorage.setItem('bus_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (name, email, phone, password) => {
    const data = await api.post('/auth/register', { name, email, phone, password });
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('bus_token', data.token);
      localStorage.setItem('bus_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('bus_token');
    localStorage.removeItem('bus_user');
  };

  const updateProfile = async (name, phone) => {
    const data = await api.put('/auth/profile', { name, phone });
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('bus_user', JSON.stringify(data.user));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
