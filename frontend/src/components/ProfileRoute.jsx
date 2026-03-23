import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Profile from '../pages/Profile.jsx';

const ProfileRoute = () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user;

  console.log('ProfileRoute - Checking authentication status');
  console.log('ProfileRoute - Token from localStorage:', token);
  console.log('ProfileRoute - User string from localStorage:', userStr);

  try {
    user = userStr ? JSON.parse(userStr) : null;
    console.log('ProfileRoute - Parsed user from localStorage:', user);
  } catch (e) {
    console.error('ProfileRoute - Error parsing user from localStorage:', e);
    user = null;
  }

  console.log('ProfileRoute - User ID:', user && user.id ? user.id : 'No user ID');

  // Check if both token and user ID exist
  if (!token) {
    console.log('ProfileRoute - No token found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log('ProfileRoute - No user found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!user.id) {
    console.log('ProfileRoute - No user ID found, redirecting to login page');
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  console.log('ProfileRoute - User is authenticated, rendering Profile component');
  // If logged in, render the Profile component
  return <Profile />;
};

export default ProfileRoute;
