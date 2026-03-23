import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // Check if user is logged in and is admin
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user;

  console.log('AdminRoute - Checking authentication status');
  console.log('AdminRoute - Token from localStorage:', token);
  console.log('AdminRoute - User string from localStorage:', userStr);

  try {
    user = userStr ? JSON.parse(userStr) : null;
    console.log('AdminRoute - Parsed user from localStorage:', user);
  } catch (e) {
    console.error('AdminRoute - Error parsing user from localStorage:', e);
    user = null;
  }

  console.log('AdminRoute - User ID:', user && user.id ? user.id : 'No user ID');
  console.log('AdminRoute - User role:', user && user.role ? user.role : 'No user role');

  // Check if both token and user ID exist
  if (!token) {
    console.log('AdminRoute - No token found, redirecting to admin login page');
    // If not logged in, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  if (!user) {
    console.log('AdminRoute - No user found, redirecting to admin login page');
    // If not logged in, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.id) {
    console.log('AdminRoute - No user ID found, redirecting to admin login page');
    // If not logged in, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    console.log('AdminRoute - User is not admin, redirecting to admin login page');
    // If not admin, redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  console.log('AdminRoute - User is authenticated and is admin, rendering children');
  // If logged in and is admin, render the children
  return children;
};

export default AdminRoute;
