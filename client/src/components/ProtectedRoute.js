// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A utility function that checks if the user is authenticated
// For example, you might check a localStorage token, a session, etc.
// Replace this with your own logic!
function isAuthenticated() {
  const token = localStorage.getItem('token'); // or check a cookie, etc.
  return !!token; 
}

const ProtectedRoute = () => {
  // If user is not authenticated, navigate to /login (or your sign in route)
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
