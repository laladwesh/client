import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const storedToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  // fallback: some admin sessions set a separate userRole key
  const fallbackRole = localStorage.getItem('userRole');
  const isAuthenticated = !!storedToken;
  const isAdmin = (storedUser && storedUser.role === 'admin') || fallbackRole === 'admin';

  if (!isAuthenticated) {
    window.dispatchEvent(new CustomEvent('signup:toggle', { detail: { open: true } }));
    return <Navigate to="/" replace />;
  }
  if (!isAdmin) {
    window.dispatchEvent(new CustomEvent('signup:toggle', { detail: { open: true } }));
    return <Navigate to="/" replace />;
  }
  return children;
}
