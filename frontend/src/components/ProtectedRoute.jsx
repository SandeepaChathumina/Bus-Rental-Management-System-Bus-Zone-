// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // while we know auth state -> show nothing (or spinner)
  if (loading) return null; // or a small spinner component

  // if not logged in -> go to login
  if (!user) return <Navigate to="/login" replace />;

  // If allowedRoles empty -> allow any authenticated user
  if (allowedRoles.length === 0) return children;

  // Admin override: allow admin for any allowedRoles route
  if (user.role === 'admin') return children;

  // If user's role is included -> allow
  if (allowedRoles.includes(user.role)) {
    return children;
  }

  // Not authorized -> redirect to a safe page based on role
  switch (user.role) {
    case 'driver':
      return <Navigate to="/driver-dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff-dashboard" replace />;
    case 'passenger':
    default:
      return <Navigate to="/booking" replace />;
  }
};

export default ProtectedRoute;
