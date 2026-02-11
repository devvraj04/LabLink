import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // Also check if a patient is logged in via localStorage (patient login bypasses AuthContext)
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  let userRole = null;
  let isAuthenticated = isLoggedIn;

  if (storedUser && storedToken) {
    try {
      const parsed = JSON.parse(storedUser);
      userRole = parsed.role || null;
      isAuthenticated = true;
    } catch (e) { /* ignore */ }
  }

  // Show loading spinner while checking authentication
  if (loading && !storedToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restriction: if allowedRoles is specified and user role is not in it
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect patient to their dashboard, admin to admin dashboard
    if (userRole === 'patient') {
      return <Navigate to="/app/lab-patient" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  // If a patient is trying to access any route and we detect it's not in patient-allowed paths
  if (userRole === 'patient') {
    const patientAllowedPaths = [
      '/app/lab-patient',
      '/app/lab-catalog',
      '/app/medical-record',
      '/app/camps',
    ];
    const currentPath = location.pathname;
    const isAllowed = patientAllowedPaths.some(p => currentPath.startsWith(p));
    if (!isAllowed) {
      return <Navigate to="/app/lab-patient" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
