import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import PlantLoader from '../PlantLoader/PlantLoader';

export default function ProtectedRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return <PlantLoader variant="overlay" />;
  }

  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
