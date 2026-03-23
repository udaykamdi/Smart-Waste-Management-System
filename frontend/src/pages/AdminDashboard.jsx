import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import TaskList from '../components/TaskList.jsx';
import axios from '../config/axios.js';
import { getUsersByFilter, getAreas, getPendingComplaints } from '../services/api.js';

function AdminDashboard() {
  const role = 'admin';
  const userName = 'Admin User';
  const [activeDriversCount, setActiveDriversCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const drivers = await getUsersByFilter('driver', 'active');
        setActiveDriversCount(drivers.length);
      } catch (error) {
        console.error('Error fetching active drivers:', error);
        // Keep the default value if there's an error
      }
    };

    fetchActiveDrivers();
  }, []);

  // New state for total locations count
  const [totalLocationsCount, setTotalLocationsCount] = React.useState(0);

  React.useEffect(() => {
    const fetchTotalLocations = async () => {
      try {
        const data = await getAreas();
        // Handle the API response structure
        let count = 0;
        if (data && data.vadodara_societies_by_area) {
          count = Object.keys(data.vadodara_societies_by_area).length;
        } else if (Array.isArray(data)) {
          count = data.length;
        }
        setTotalLocationsCount(count);
      } catch (error) {
        console.error('Error fetching total locations:', error);
        setTotalLocationsCount(0);
      }
    };

    fetchTotalLocations();
  }, []);

  // New state for pending complaints count
  const [pendingComplaintsCount, setPendingComplaintsCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPendingComplaints = async () => {
      try {
        const complaints = await getPendingComplaints();
        setPendingComplaintsCount(complaints.length);
      } catch (error) {
        console.error('Error fetching pending complaints:', error);
        setPendingComplaintsCount(0);
      }
    };

    fetchPendingComplaints();
  }, []);



  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar role={role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} flex-1 flex flex-col transition-all duration-300`}>
        <div className="bg-blue-600 shadow-md p-4 flex items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <main className="p-8 overflow-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-blue-900">Admin Dashboard</h1>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Total Locations</h3>
              <p className="text-4xl font-extrabold text-blue-600">{totalLocationsCount}</p>
              <p className="text-sm text-gray-500 mt-2">Service areas</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Active Drivers</h3>
              <p className="text-4xl font-extrabold text-blue-700">{activeDriversCount}</p>
              <p className="text-sm text-gray-500 mt-2">On duty today</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Completion Rate</h3>
              <p className="text-4xl font-extrabold text-blue-800">99%</p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Complaints</h3>
              <p className="text-4xl font-extrabold text-gray-600">{pendingComplaintsCount}</p>
              <p className="text-sm text-gray-500 mt-2">Awaiting resolution</p>
            </div>
          </div>

          {/* Task List */}
          <TaskList />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
