import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user;
  
  console.log('PrivateRoute - Checking authentication status');
  console.log('PrivateRoute - Token from localStorage:', token);
  console.log('PrivateRoute - User string from localStorage:', userStr);
  
  try {
    user = userStr ? JSON.parse(userStr) : null;
    console.log('PrivateRoute - Parsed user from localStorage:', user);
  } catch (e) {
    console.error('PrivateRoute - Error parsing user from localStorage:', e);
    user = null;
  }
  
  console.log('PrivateRoute - User ID:', user && user.id ? user.id : 'No user ID');

  // Check if both token and user ID exist
  if (!token) {
    console.log('PrivateRoute - No token found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  if (!user) {
    console.log('PrivateRoute - No user found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!user.id) {
    console.log('PrivateRoute - No user ID found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  console.log('PrivateRoute - User is authenticated, rendering children');
  // If logged in, render the children
  return children;
};

export default PrivateRoute;
