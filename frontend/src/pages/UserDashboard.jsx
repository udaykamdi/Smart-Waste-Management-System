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
        // Debug: Log localStorage contents
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log('Token from localStorage in UserDashboard:', token);
        console.log('User from localStorage in UserDashboard:', storedUser);
        if (!storedUser || !storedUser.id) {
          console.error('User not logged in in UserDashboard');
          return;
        }
        
        // Check if token exists
        if (!token) {
          console.error('No authentication token found in UserDashboard');
          return;
        }
        
        // Fetch user schedules
        const response = await axios.get(`/schedules/my`);
        console.log('User schedules response:', response.data);
        
        // Handle the case where response.data might be an object instead of an array
        const schedules = Array.isArray(response.data) ? response.data : (response.data?.schedules || []);
        
        // Map schedules to the format needed for display
        const userSchedulesData = schedules
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
        <main className="p-6 overflow-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Waste Reporting Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🚨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Report Waste Issue</h2>
              </div>
              <form onSubmit={handleReportSubmit} className="space-y-6">
                {/* Waste Type removed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    value={wasteReport.description}
                    onChange={(e) => setWasteReport({...wasteReport, description: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition duration-200 text-lg resize-none"
                    rows="3"
                    placeholder="Describe the waste issue in detail..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Location</label>
                  <select
                    value={wasteReport.location}
                    onChange={(e) => setWasteReport({...wasteReport, location: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition duration-200 text-lg"
                    required
                  >
                    <option value="">Select your location</option>
                    {Array.isArray(locations) && locations.map((loc, index) => (
                      <option key={index} value={loc.area || loc}>
                        {loc.area || loc}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Capacity Level removed */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition duration-300 shadow-lg font-semibold text-lg transform hover:scale-105"
                >
                  🚀 Submit Report
                </button>
              </form>
            </div>

            {/* Collection Schedule */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Collection Schedule</h2>
                </div>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition duration-300 shadow-md font-medium"
                >
                  📝 Request Custom
                </button>
              </div>
              
              {/* Custom Schedules */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Custom Schedules</h3>
                
                {loadingSchedules ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="text-gray-500">Loading schedules...</div>
                  </div>
                ) : userSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {userSchedules.map((schedule) => (
                      <div key={schedule.id} className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 ${
                        schedule.status === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : 
                        schedule.status === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : ''
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-lg">Custom Pickup Request</h4>
                            <p className="text-sm text-gray-600">{schedule.wasteType} Waste</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            schedule.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : schedule.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{schedule.reason}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div><strong>Address:</strong> {schedule.location}</div>
                          <div><strong>Waste Type:</strong> {schedule.wasteType}</div>
                          <div><strong>Date:</strong> {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'Date not provided'}</div>
                          <div><strong>Time:</strong> {schedule.time || 'Time not provided'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No custom schedules requested yet</div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 lg:col-span-2 xl:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">🔔</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
              </div>
              
              {loadingSchedules ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-lg text-gray-500">Loading notifications...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition duration-200 ${
                    notification.type === 'info'
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100'
                      : notification.type === 'pending'
                      ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100'
                      : notification.type === 'success'
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100'
                      : 'border-red-500 bg-gradient-to-r from-red-50 to-red-100'
                  }`}>
                    <div className="flex items-start">
                      <span className="text-xl mr-3">{notification.icon}</span>
                      <p className="text-gray-700 font-medium">{notification.message}</p>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </div>
            </div>
          

          {/* Custom Schedule Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl w-[95vw] max-w-md sm:max-w-lg mx-2 sm:mx-4 overflow-y-auto max-h-[90vh] flex flex-col">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Request Custom Pickup</h2>
                </div>
                <form onSubmit={handleScheduleSubmit} className="space-y-6 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
                    <input
                      type="text"
                      value={customSchedule.address}
                      onChange={e => setCustomSchedule({ ...customSchedule, address: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition duration-200 text-lg"
                      placeholder="Enter your full address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Waste Type</label>
                    <input
                      type="text"
                      value={customSchedule.wasteType}
                      onChange={e => setCustomSchedule({ ...customSchedule, wasteType: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition duration-200 text-lg"
                      placeholder="e.g., Electronics, Furniture"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Preferred Date</label>
                    <input
                      type="date"
                      value={customSchedule.date}
                      onChange={(e) => setCustomSchedule({...customSchedule, date: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition duration-200 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Preferred Time</label>
                    <input
                      type="time"
                      value={customSchedule.time}
                      onChange={(e) => setCustomSchedule({...customSchedule, time: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition duration-200 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Reason for Request</label>
                    <textarea
                      value={customSchedule.reason}
                      onChange={(e) => setCustomSchedule({...customSchedule, reason: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition duration-200 text-lg resize-none"
                      rows="3"
                      placeholder="Please explain why you need a custom pickup..."
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition duration-300 shadow-lg font-semibold text-lg"
                    >
                      📤 Send Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition duration-300 shadow-lg font-semibold text-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main> 
      </div>
    </div>
  );
}

export default UserDashboard;
