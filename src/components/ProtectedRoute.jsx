import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../api_services/authService';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const auth = authService.isAuthenticated();
      setAuthenticated(auth);
    } catch (err) {
      console.error('Auth check failed:', err);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return null; // Yoxlama bitənə qədər heç nə göstərmir

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
