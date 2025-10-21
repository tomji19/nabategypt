import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';

export default function ProtectedRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  // If still loading, you might want to show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the children
  return children;
}