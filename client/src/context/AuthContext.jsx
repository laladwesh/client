import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    let storedToken = localStorage.getItem('token');
    let storedUser = localStorage.getItem('user');

    // Migration: if adminToken/userRole exist (from AdminJS) but standard keys are missing,
    // copy them so the SPA recognizes admin sessions regardless of login path.
    if (!storedToken && localStorage.getItem('adminToken')) {
      storedToken = localStorage.getItem('adminToken');
      localStorage.setItem('token', storedToken);
    }
    if (!storedUser && localStorage.getItem('userRole')) {
      try {
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('spirit:user') ? JSON.parse(localStorage.getItem('spirit:user')).name : 'Admin';
        const migrated = { name, role };
        localStorage.setItem('user', JSON.stringify(migrated));
        storedUser = localStorage.getItem('user');
      } catch (e) {
        // ignore migration errors
      }
    }

    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    setIsAdmin(user.role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
