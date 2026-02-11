import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHospitalAuth } from '../context/HospitalAuthContext';

const HospitalProtectedRoute = ({ children }) => {
  const { hospital, hospitalLoading } = useHospitalAuth();

  if (hospitalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default HospitalProtectedRoute;
