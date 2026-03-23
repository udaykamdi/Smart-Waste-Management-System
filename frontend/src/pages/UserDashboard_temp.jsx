import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getAreas } from '../services/api';
import Header from '../components/Header.jsx';
import axios from '../config/axios';
function UserDashboard() {
  const role = 'user';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = 'John Doe'; // This would come from authentication

  const [wasteReport, setWasteReport] = useState({
    type: '',
    description: '',
    location: '',
    urgency: 'low'
  });

  const [customSchedule, setCustomSchedule] = useState({
    date: '',
    time: '',
    reason: '',
    wasteType: '',
    address: ''
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getAreas().then(data => {
      // Handle different possible response formats
      if (Array.isArray(data)) {
        setLocations(data);
      } else if (data && Array.isArray(data.areas)) {
        setLocations(data.areas);
      } else if (data && data.vadodara_societies_by_area) {
        // Extract area names from the object
        const areas = Object.keys(data.vadodara_societies_by_area);
        setLocations(areas);
      } else {
        console.error('Unexpected data format for locations:', data);
        setLocations([]);
      }
    }).catch(err => {
      console.error('Failed to fetch locations:', err);
      setLocations([]);
    });
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.id) {
        alert('User not logged in. Please log in again.');
        return;
      }
      await axios.post('/complaints', {
        user: storedUser.id,
        description: `${wasteReport.type ? `[${wasteReport.type}] ` : ''}${wasteReport.description}${wasteReport.location ? ` - Location: ${wasteReport.location}` : ''}`,
        suggestedBin: true
      });
      setWasteReport({ type: '', description: '', location: '', urgency: 'low' });
      alert('Waste report submitted successfully!');
    } catch (err) {
      console.error('Failed to submit report:', err);

      // Provide more specific error messages based on the error response
      let errorMessage = 'Failed to submit report.';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      alert(errorMessage);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.id) {
        alert('User not logged in. Please log in again.');
        return;
      }
      await axios.post('/schedules', {
        ...customSchedule,
        location: customSchedule.address, // Map address to location field
        user: storedUser.id
      });
      alert('Custom pickup schedule requested! Admin will review your request.');
      setCustomSchedule({ date: '', time: '', reason: '', wasteType: '', address: '' });
      setShowScheduleModal(false);
    } catch (err) {
      console.error('Failed to submit custom schedule:', err);

      // Provide more specific error messages based on the error response
      let errorMessage = 'Failed to submit custom schedule request.';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      alert(errorMessage);
    }
  };

  const collectionSchedule = [
    { day: 'Monday', time: '8:00 AM - 10:00 AM', area: 'Downtown', icon: '🏙️' },
    { day: 'Wednesday', time: '2:00 PM - 4:00 PM', area: 'Residential', icon: '🏠' },
    { day: 'Friday', time: '9:00 AM - 11:00 AM', area: 'Commercial', icon: '🏢' },
  ];

  const [notifications, setNotifications] = useState([]);
  const [userSchedules, setUserSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastStatusChange, setLastStatusChange] = useState(null);

  // Function to refresh schedules
  const refreshSchedules = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Auto refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSchedules();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch user schedules
  useEffect(() => {
    const fetchUserSchedules = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.id) {
          return;
        }

        // Debug: Log localStorage contents
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        console.log('User from localStorage:', storedUser);

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Fetch user schedules
        const response = await axios.get(`/schedules`);
        console.log('User schedules response:', response.data);

        // Handle the case where response.data might be an object instead of an array
        const schedules = Array.isArray(response.data) ? response.data : (response.data?.schedules || []);

        // Filter schedules for the current user
        const userSchedulesData = schedules
          .filter(schedule => schedule.user && schedule.user._id === storedUser.id)
          .map(schedule => ({
            id: schedule._id,
            date: schedule.date,
            time: schedule.time,
            reason: schedule.reason,
            wasteType: schedule.wasteType,
            location: schedule.location,
            status: schedule.status || 'pending'
          }));

        // Check for status changes
        const statusChanged = userSchedulesData.some(schedule => {
          const previousStatus = lastStatusChange?.[schedule.id];
          return previousStatus && previousStatus !== schedule.status;
        });

        // Update last status change
        const newStatusChange = {};
        userSchedulesData.forEach(schedule => {
          newStatusChange[schedule.id] = schedule.status;
        });
        setLastStatusChange(newStatusChange);

        setUserSchedules(userSchedulesData);

        // Update notifications based on schedule status
        const newNotifications = [];

        // Add special notification for status changes
        if (statusChanged) {
          newNotifications.unshift({
            id: 'status-change',
            message: 'Your schedule status has been updated by the admin.',
            type: 'info',
            icon: '🔄',
            isStatusChange: true
          });
        }

        // Add notifications for each schedule
        userSchedulesData.forEach(schedule => {
          let statusType = 'pending';
          let statusIcon = '⏳';
          let statusMessage = 'Your custom pickup request is being reviewed.';

          if (schedule.status === 'approved') {
            statusType = 'success';
            statusIcon = '✅';
            statusMessage = `Your custom pickup on ${new Date(schedule.date).toLocaleDateString()} at ${schedule.time} has been approved.`;
          } else if (schedule.status === 'rejected') {
            statusType = 'error';
            statusIcon = '❌';
            statusMessage = `Your custom pickup request has been rejected.`;
          }

          newNotifications.push({
            id: schedule.id,
            message: statusMessage,
            type: statusType,
            icon: statusIcon,
            scheduleData: schedule
          });
        });

        setNotifications(newNotifications);
      } catch (err) {
        console.error('Error fetching user schedules:', err);

        // Show error notification
        setNotifications([{
          id: 'error',
          message: 'Failed to fetch your schedules. Please try again later.',
          type: 'error',
          icon: '❌'
        }]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchUserSchedules();
  }, [refreshKey]);



  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar role={role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} flex-1 flex flex-col transition-all duration-300`}>
        <div className="bg-green-600 shadow-md p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold text-white">User Dashboard</h1>
        </div>

        <main className="p-8 overflow-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Welcome, {userName}!</h2>

          {/* Notifications Section */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-md ${
                      notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500' :
                      notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' :
                      notification.type === 'info' ? 'bg-blue-100 border-l-4 border-blue-500' :
                      'bg-yellow-100 border-l-4 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{notification.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{notification.message}</p>
                        {notification.scheduleData && (
                          <button
                            onClick={() => {
                              // Could open a modal with more details
                              alert('Schedule details: ' + JSON.stringify(notification.scheduleData, null, 2));
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600">No notifications at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Waste Report Section */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Report Waste Issue</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Type of Waste</label>
                <select
                  value={wasteReport.type}
                  onChange={(e) => setWasteReport({...wasteReport, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select waste type</option>
                  <option value="General Waste">General Waste</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Hazardous">Hazardous</option>
                  <option value="Organic">Organic</option>
                  <option value="E-waste">E-waste</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={wasteReport.description}
                  onChange={(e) => setWasteReport({...wasteReport, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Describe the waste issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Location</label>
                <select
                  value={wasteReport.location}
                  onChange={(e) => setWasteReport({...wasteReport, location: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select location</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Urgency</label>
                <div className="flex space-x-4">
                  {['low', 'medium', 'high'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={wasteReport.urgency === level}
                        onChange={() => setWasteReport({...wasteReport, urgency: level})}
                        className="mr-2"
                      />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-300"
              >
                Submit Report
              </button>
            </form>
          </div>

          {/* Collection Schedule Section */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Regular Collection Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collectionSchedule.map((schedule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{schedule.icon}</span>
                    <h4 className="text-lg font-semibold">{schedule.day}</h4>
                  </div>
                  <p className="text-gray-600">{schedule.time}</p>
                  <p className="text-gray-600">{schedule.area}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Schedule Section */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Custom Pickup Schedule</h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
              >
                Request Custom Pickup
              </button>
            </div>

            {loadingSchedules ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading your schedules...</p>
              </div>
            ) : userSchedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(schedule.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{schedule.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{schedule.wasteType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{schedule.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            schedule.status === 'approved' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No custom schedules found. Request a custom pickup using the button above.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Custom Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Request Custom Pickup</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={customSchedule.date}
                  onChange={(e) => setCustomSchedule({...customSchedule, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={customSchedule.time}
                  onChange={(e) => setCustomSchedule({...customSchedule, time: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Waste Type</label>
                <select
                  value={customSchedule.wasteType}
                  onChange={(e) => setCustomSchedule({...customSchedule, wasteType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select waste type</option>
                  <option value="General Waste">General Waste</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Hazardous">Hazardous</option>
                  <option value="Organic">Organic</option>
                  <option value="E-waste">E-waste</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  value={customSchedule.address}
                  onChange={(e) => setCustomSchedule({...customSchedule, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                  placeholder="Enter your address"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Reason</label>
                <textarea
                  value={customSchedule.reason}
                  onChange={(e) => setCustomSchedule({...customSchedule, reason: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Explain why you need a custom pickup..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;