import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAuthenticated = !!storedToken;
  const isAdmin = storedUser && storedUser.role === 'admin';

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
