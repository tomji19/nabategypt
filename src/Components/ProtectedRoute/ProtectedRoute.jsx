import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import PlantLoader from '../PlantLoader/PlantLoader';

export default function ProtectedRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PlantLoader variant="overlay" />;
  }

  if (!userLoggedIn) {
    const from = `${location.pathname}${location.search || ''}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}
