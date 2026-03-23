
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import axios from '../config/axios';
import { getAreaByName } from '../services/api';

function DriverDashboard() {
  const role = 'driver';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get user from localStorage (set at login/profile update)
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const userName = storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName}` : 'Driver';

  // Driver status state
  const [status, setStatus] = useState(storedUser.status || 'inactive');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Area and sub-areas state
  const [assignedArea, setAssignedArea] = useState(storedUser.area || '');
  const [subAreas, setSubAreas] = useState([]);
  const [loadingSubAreas, setLoadingSubAreas] = useState(false);

  // Fetch latest status and area from backend on mount
  useEffect(() => {
    async function fetchDriverData() {
      try {
        const res = await axios.get('/profile');
        const userData = res.data.user;
        setStatus(userData.status || 'inactive');
        setAssignedArea(userData.area || '');
        // Update localStorage for consistency
        localStorage.setItem('user', JSON.stringify(userData));

        // If area is assigned, fetch sub-areas
        if (userData.area) {
          fetchSubAreas(userData.area);
        }
      } catch (err) {
        // fallback to localStorage
        setStatus(storedUser.status || 'inactive');
        setAssignedArea(storedUser.area || '');

        // If area exists in localStorage, try to fetch sub-areas
        if (storedUser.area) {
          fetchSubAreas(storedUser.area);
        }
      }
    }

    const fetchSubAreas = async (areaName) => {
      if (!areaName) return;

      try {
        setLoadingSubAreas(true);
        const areaData = await getAreaByName(areaName);

        // Handle different response formats
        if (areaData && areaData.societies && Array.isArray(areaData.societies)) {
          // Convert societies to route stops format
          const stops = areaData.societies.map((society, index) => ({
            stop: index + 1,
            location: society,
            time: `${8 + index * 1.5}:00 AM`, // Generate times starting from 8 AM
            status: index === 0 ? 'In Progress' : 'Pending'
          }));
          setSubAreas(stops);
        } else {
          console.error('Unexpected area data format:', areaData);
          setSubAreas([]);
        }
      } catch (err) {
        console.error('Failed to fetch sub-areas:', err);
        // Fallback to some default sub-areas
        setSubAreas([
          { stop: 1, location: `${areaName} - Central`, time: '8:00 AM', status: 'In Progress' },
          { stop: 2, location: `${areaName} - North`, time: '9:30 AM', status: 'Pending' },
          { stop: 3, location: `${areaName} - South`, time: '11:00 AM', status: 'Pending' },
          { stop: 4, location: `${areaName} - East`, time: '12:30 PM', status: 'Pending' }
        ]);
      } finally {
        setLoadingSubAreas(false);
      }
    };

    fetchDriverData();
    // eslint-disable-next-line
  }, []);

  // Toggle status handler
  const handleToggleStatus = async () => {
    setLoadingStatus(true);
    const newStatus = status === 'active' ? 'inactive' : 'active';
    console.log('Sending status update:', { email: storedUser.email, status: newStatus });
    if (!storedUser.email) {
      alert('Driver email missing. Please log in again.');
      setLoadingStatus(false);
      return;
    }
    try {
      const res = await axios.put('/driver/status', { email: storedUser.email, status: newStatus });
      setStatus(res.data.status);
      setStatusMsg(`Status updated to ${res.data.status}`);
      // Update localStorage
      const updatedUser = { ...storedUser, status: res.data.status };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      setStatusMsg('Failed to update status');
      setTimeout(() => setStatusMsg(''), 2000);
    }
    setLoadingStatus(false);
  };

  // Get completed tasks from localStorage
  const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Filter completed tasks for the current user
  const userCompletedTasks = completedTasks.filter(task => task.driverId === user._id);

  // Get the subarea names of completed tasks
  const completedSubareas = React.useMemo(() => {
    return userCompletedTasks.map(task => task.subarea);
  }, [userCompletedTasks]);

  // Generate assigned tasks based on subareas, excluding completed ones
  const areaTasks = subAreas
    .filter(subarea => !completedSubareas.includes(subarea.location))
    .map((subarea, index) => ({
      id: index + 1,
      title: `Garbage Collection - ${subarea.location}`,
      description: `Collect garbage from ${subarea.location}`,
      status: subarea.status,
      priority: 'Medium',
      estimatedTime: '1 hour',
      location: subarea.location,
      time: subarea.time,
      type: 'area'
    }));

  // State for custom pickup tasks
  const [customTasks, setCustomTasks] = useState([]);

  // Fetch custom pickup tasks assigned to this driver
  useEffect(() => {
  const fetchCustomTasks = async () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    try {
      // Try to fetch schedules assigned to this driver
      const response = await axios.get('/schedules/assigned');
      const schedules = Array.isArray(response.data) ? response.data : (response.data?.schedules || []);

      // Only show schedules assigned to this driver
      const driverCustomTasks = schedules
        .filter(schedule =>
          ['approved', 'assigned', 'completed'].includes(schedule.status)
        )
        .map((schedule, index) => ({
          id: `custom-${index}`,
          title: 'Custom Pickup Request',
          description: schedule.reason,
          status: schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1),
          priority: 'High',
          estimatedTime: '45 minutes',
          location: schedule.location || 'Custom Location',
          time: schedule.time || 'Flexible',
          type: 'custom',
          scheduleId: schedule._id,
          userName: schedule.user?.firstName && schedule.user?.lastName ? 
            `${schedule.user.firstName} ${schedule.user.lastName}` : 
            schedule.user?.firstName || 'Unknown User',
          userEmail: schedule.user?.email || ''
        }));

      setCustomTasks(driverCustomTasks);
    } catch (err) {
      console.error('Error fetching custom tasks:', err);
      setCustomTasks([]);
    }
  };

  fetchCustomTasks();
}, [user._id]);

  // Combine area tasks and custom tasks
  const assignedTasks = [...areaTasks, ...customTasks];

  // Update subAreas status based on completed tasks
  useEffect(() => {
    if (subAreas.length > 0 && completedSubareas.length > 0) {
      const updatedSubAreas = subAreas.map(subarea => {
        if (completedSubareas.includes(subarea.location)) {
          return { ...subarea, status: 'Completed' };
        }
        return subarea;
      });

      // If there's a completed task, update the next task to "In Progress"
      const lastCompletedIndex = updatedSubAreas
        .map(s => s.status === 'Completed')
        .lastIndexOf(true);

      if (lastCompletedIndex >= 0 && lastCompletedIndex < updatedSubAreas.length - 1) {
        updatedSubAreas[lastCompletedIndex + 1] = {
          ...updatedSubAreas[lastCompletedIndex + 1],
          status: 'In Progress'
        };
      }

      setSubAreas(updatedSubAreas);
    }
  }, [completedSubareas]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Find the task to get the location and type
      const task = assignedTasks.find(t => t.id === taskId);
      if (!task) return;

      // Handle different task types
      if (task.type === 'area') {
        // Update the subarea status
        const updatedSubAreas = subAreas.map(subarea => {
          if (subarea.location === task.location) {
            return { ...subarea, status: newStatus };
          }
          return subarea;
        });

        setSubAreas(updatedSubAreas);

        // If marking as complete, move the task to completed tasks and update the next subarea to "In Progress"
        if (newStatus === 'Completed') {
          // Get user information
          const user = JSON.parse(localStorage.getItem('user')) || {};

          // Create a completed task record
          const completedTask = {
            id: taskId,
            driverId: user._id,
            title: task.title,
            area: assignedArea,
            subarea: task.location,
            completedDate: new Date().toLocaleDateString(),
            completedAt: new Date().toISOString()
          };

          // Get existing completed tasks or initialize empty array
          const existingCompletedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');

          // Add the new completed task
          const updatedCompletedTasks = [...existingCompletedTasks, completedTask];

          // Save to localStorage
          localStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));

          // Update the next subarea to "In Progress"
          const currentIndex = subAreas.findIndex(s => s.location === task.location);
          if (currentIndex >= 0 && currentIndex < subAreas.length - 1) {
            const nextSubAreas = [...updatedSubAreas];
            nextSubAreas[currentIndex + 1] = {
              ...nextSubAreas[currentIndex + 1],
              status: 'In Progress'
            };
            setSubAreas(nextSubAreas);
          }
        }
      } else if (task.type === 'custom' && task.scheduleId) {
        // Update custom task status in the backend
        await axios.put(`/schedules/${task.scheduleId}`, { status: newStatus.toLowerCase() });

        // Update the custom task in local state
        const updatedCustomTasks = customTasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        );
        setCustomTasks(updatedCustomTasks);
      }

      // Here you would also send the update to the backend
      console.log(`Updating task ${taskId} to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50" key="dashboard-page">
      <Sidebar role={role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} flex-1 flex flex-col transition-all duration-300`}>
        <div className="bg-orange-400 shadow-md p-4 flex items-center">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold text-white">Driver Dashboard</h1>
        </div>
        <main className="p-6 overflow-auto">

          {/* Driver Status and Area Information */}
          <div className="mb-8 flex flex-wrap items-center gap-6">
            <span className={`px-4 py-2 rounded-full font-semibold text-lg shadow ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>Status: {status === 'active' ? 'Active' : 'Inactive'}</span>

            {assignedArea && (
              <span className="px-4 py-2 rounded-full font-semibold text-lg shadow bg-blue-100 text-blue-700">
                Assigned Area: {assignedArea}
              </span>
            )}

            <button
              onClick={handleToggleStatus}
              disabled={loadingStatus}
              className={`px-6 py-2 rounded-lg font-bold transition duration-300 shadow ${status === 'active' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-60`}
            >
              {loadingStatus ? 'Updating...' : status === 'active' ? 'Set Inactive' : 'Set Active'}
            </button>
            {statusMsg && <span className="ml-4 text-blue-700 font-medium animate-fade-in">{statusMsg}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned Tasks */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Assigned Tasks</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {assignedTasks.map((task, index) => (
                  <div key={task.id} className={`border rounded-lg p-4 bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-105 animate-fade-in ${task.type === 'custom' ? 'border-purple-300' : 'border-gray-200'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        {task.type === 'custom' && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    {task.type === 'custom' && task.userName && (
                      <div className="text-xs text-gray-500 mb-1">
                        <strong>Requested by:</strong> {task.userName} {task.userEmail && `(${task.userEmail})`}
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Est. Time: {task.estimatedTime}</span>
                      <span>Scheduled Time: {task.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'Completed')}
                          className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-110"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Pickup Requests */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Pickups</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {customTasks.length > 0 ? (
                  customTasks.map((task, index) => (
                    <div key={task.id} className="border border-purple-300 rounded-lg p-4 bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-105 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-800">{task.title}</h3>
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Custom
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      {task.type === 'custom' && task.userName && (
                        <div className="text-xs text-gray-500 mb-1">
                          <strong>Requested by:</strong> {task.userName} {task.userEmail && `(${task.userEmail})`}
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Est. Time: {task.estimatedTime}</span>
                        <span>Scheduled Time: {task.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-110"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No custom pickup requests assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DriverDashboard;

