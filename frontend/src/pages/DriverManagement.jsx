
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import axios from '../config/axios';
import { getAreas } from '../services/api';

function DriverManagement() {
  const role = 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = 'Admin User';
  const [drivers, setDrivers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState({});
  const navigate = useNavigate();
  const statusColors = {
    Active: 'text-green-600',
    Inactive: 'text-gray-500',
  };

  // Fetch areas from API
  useEffect(() => {
    async function fetchAreas() {
      try {
        setLoadingAreas(true);
        const data = await getAreas();
        // Handle different possible response formats
        if (Array.isArray(data)) {
          setAreas(data);
        } else if (data && Array.isArray(data.areas)) {
          setAreas(data.areas);
        } else if (data && data.vadodara_societies_by_area) {
          // Extract area names from the object
          const areaNames = Object.keys(data.vadodara_societies_by_area);
          setAreas(areaNames.map(area => ({ area })));
        } else {
          console.error('Unexpected data format for areas:', data);
          setAreas([]);
        }
      } catch (err) {
        console.error('Failed to fetch areas:', err);
        setAreas([]);
      } finally {
        setLoadingAreas(false);
      }
    }
    fetchAreas();
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    let isMounted = true;
    async function fetchDrivers() {
      try {
        const res = await axios.get('/auth/users');
        if (isMounted) {
          const driverList = res.data.filter(u => u.role === 'driver');
          setDrivers(driverList);

          // Initialize selected areas for drivers if not already set
          const initialSelectedAreas = {...selectedAreas};
          driverList.forEach(driver => {
            if (!initialSelectedAreas[driver._id] && driver.area) {
              initialSelectedAreas[driver._id] = driver.area;
            }
          });
          setSelectedAreas(initialSelectedAreas);
        }
      } catch (err) {
        if (isMounted) setDrivers([]);
      }
    }
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 5000); // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedAreas]);

  const handleAreaChange = async (driverId, areaName) => {
    try {
      // Update the selected area in state
      setSelectedAreas(prev => ({
        ...prev,
        [driverId]: areaName
      }));

      // Send update to backend
      await axios.put(`/auth/users/${driverId}`, { area: areaName });

      // Show success message
      alert('Area assigned successfully!');
    } catch (err) {
      console.error('Failed to assign area:', err);
      alert('Failed to assign area. Please try again.');

      // Revert the selection on error
      setSelectedAreas(prev => {
        const newSelectedAreas = {...prev};
        delete newSelectedAreas[driverId];
        return newSelectedAreas;
      });
    }
  };

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
          <h1 className="ml-4 text-xl font-bold text-white">Driver Management</h1>
        </div>
        <main className="p-8 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drivers.map((driver, idx) => (
              <div
                key={driver._id}
                className="bg-white rounded-xl shadow-lg p-8 flex flex-col hover:shadow-2xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-bold mb-4">Driver {idx + 1}</h2>
                <p className="text-gray-800 mb-3">Name: {driver.firstName} {driver.lastName}</p>
                <p className={`mb-3 font-semibold text-lg ${driver.status === 'inactive' ? 'text-gray-500' : 'text-green-600'}`}>
                  Status: {driver.status === 'inactive' ? 'Inactive' : 'Active'}
                </p>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Assign Area
                  </label>
                  {loadingAreas ? (
                    <p className="text-gray-500">Loading areas...</p>
                  ) : (
                    <select
                      value={selectedAreas[driver._id] || driver.area || ''}
                      onChange={(e) => handleAreaChange(driver._id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select an area</option>
                      {areas.map((area, index) => (
                        <option key={index} value={area.area || area}>
                          {area.area || area}
                        </option>
                      ))}
                    </select>
                  )}
                  {driver.area && (
                    <p className="mt-1 text-sm text-gray-600">
                      Currently assigned: {driver.area}
                    </p>
                  )}
                </div>

                <button
                  className="mt-auto bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-800 transition duration-300 font-semibold shadow-md"
                  onClick={() => navigate(`/admin/driver/${driver._id}`)}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DriverManagement;

