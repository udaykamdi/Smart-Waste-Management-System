import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import { FaTrashAlt, FaExclamationTriangle, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { getAreas } from '../services/api.js';

function BinManagement() {
  const role = 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = 'Admin User';

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    Normal: 'text-green-600',
    Warning: 'text-yellow-500',
    Critical: 'text-red-600',
  };

  const statusIcons = {
    Normal: <FaCheckCircle className="inline mr-1" />,
    Warning: <FaExclamationTriangle className="inline mr-1" />,
    Critical: <FaTrashAlt className="inline mr-1" />,
  };

  useEffect(() => {
    async function fetchAreas() {
      try {
        console.log('Fetching areas from SWMS API...');
        const data = await getAreas();
        console.log('Areas API response:', data);

        // Handle the actual API response structure
        let areasArray = [];
        if (data && data.vadodara_societies_by_area) {
          // Convert the object keys (area names) to an array of area objects
          areasArray = Object.keys(data.vadodara_societies_by_area).map(areaName => ({
            name: areaName,
            societies: data.vadodara_societies_by_area[areaName],
            societyCount: data.vadodara_societies_by_area[areaName].length,
            fillLevel: Math.floor(Math.random() * 100), // Mock fill level
            status: Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Warning' : 'Normal' // Mock status
          }));
        } else if (Array.isArray(data)) {
          areasArray = data.map(area => ({
            ...area,
            fillLevel: area.fillLevel || Math.floor(Math.random() * 100),
            status: area.status || (Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Warning' : 'Normal')
          }));
        } else if (data && typeof data === 'object') {
          // Fallback for other object formats
          areasArray = Object.keys(data).map(key => ({
            name: key,
            societies: Array.isArray(data[key]) ? data[key] : [],
            societyCount: Array.isArray(data[key]) ? data[key].length : 0,
            fillLevel: Math.floor(Math.random() * 100),
            status: Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Warning' : 'Normal'
          }));
        }

        console.log('Processed areas array:', areasArray);
        setAreas(areasArray);
      } catch (error) {
        console.error('Failed to fetch areas:', error);
        setAreas([
          { name: 'API Error - Check Connection', societies: [], societyCount: 0, fillLevel: 0, status: 'Normal' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchAreas();
  }, []);

  if (loading) {
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
            <h1 className="ml-4 text-xl font-bold text-white">Bin Management</h1>
          </div>
          <main className="p-8 overflow-auto">
            <p>Loading areas...</p>
          </main>
        </div>
      </div>
    );
  }

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
          <h1 className="ml-4 text-xl font-bold text-white">Bin Management</h1>
        </div>
        <main className="p-8 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areas.map((area, index) => {
              // Extract area name from different possible formats
              const areaName = area.name || area.areaName || area.location || area.area || area.title || `Area ${index + 1}`;
              const areaLocation = area.location || area.address || area.city || 'N/A';

              return (
                <div
                  key={area.id || area.name || index}
                  className="bg-white rounded-xl shadow-lg p-8 flex flex-col hover:shadow-2xl transition-shadow duration-300"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    {areaName}
                  </h2>
                  <p className="text-gray-800 mb-3">
                    Area: {area.societies ? area.societies.slice(0, 3).join(', ') + (area.societies.length > 3 ? '...' : '') : 'N/A'}
                  </p>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Fill Level</label>
                  <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 ease-in-out ${
                        area.fillLevel > 80
                          ? 'bg-red-600'
                          : area.fillLevel > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${area.fillLevel || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{area.fillLevel || 0}% full</p>
                </div>
                <p className={`mb-6 font-semibold text-lg ${statusColors[area.status] || 'text-gray-600'}`}>
                  {statusIcons[area.status] || null} {area.status || 'Unknown'}
                </p>
                <button className="mt-auto bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-800 transition duration-300 font-semibold shadow-md">
                  View Details
                </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BinManagement;
