import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loading from './components/Loading.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import ProfileRoute from './components/ProfileRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));
const DriverDashboard = lazy(() => import('./pages/DriverDashboard.jsx'));
const MyTasks = lazy(() => import('./pages/MyTasks.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AssignedTasks = lazy(() => import('./pages/AssignedTasks.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const VehicleStatus = lazy(() => import('./pages/VehicleStatus.jsx'));
const TaskManagement = lazy(() => import('./pages/BinManagement.jsx'));
const VehicleManagement = lazy(() => import('./pages/ComplaintManagement.jsx'));
const EmployeeManagement = lazy(() => import('./pages/DriverManagement.jsx'));
const AlarmsAlerts = lazy(() => import('./pages/AdminProfile.jsx'));
const DriverProfile = lazy(() => import('./pages/DriverProfile.jsx'));
const AdminViewDriverProfile = lazy(() => import('./pages/AdminViewDriverProfile.jsx'));
const MyComplaints = lazy(() => import('./pages/MyComplaints.jsx'));

function LoadingWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // simulate loading delay
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return <Loading />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <LoadingWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/tasks" element={<AdminRoute><TaskManagement /></AdminRoute>} />
            <Route path="/admin/vehicles" element={<AdminRoute><VehicleManagement /></AdminRoute>} />
            <Route path="/admin/employees" element={<AdminRoute><EmployeeManagement /></AdminRoute>} />
            <Route path="/admin/alerts" element={<AdminRoute><AlarmsAlerts /></AdminRoute>} />
            <Route path="/user/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/user/tasks" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
            <Route path="/user/complaints" element={<PrivateRoute><MyComplaints /></PrivateRoute>} />
            <Route path="/user/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/driver/dashboard" element={<PrivateRoute><DriverDashboard /></PrivateRoute>} />
            <Route path="/driver/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/driver/vehicle" element={<PrivateRoute><VehicleStatus /></PrivateRoute>} />
            <Route path="/driver/profile" element={<PrivateRoute><DriverProfile /></PrivateRoute>} />
            <Route path="/admin/driver/:id" element={<PrivateRoute><AdminViewDriverProfile /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </LoadingWrapper>
      </Suspense>
    </Router>
  );
}

export default App;
