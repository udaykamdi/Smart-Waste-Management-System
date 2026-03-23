import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { getUsersByFilter } from '../services/api';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Get custom schedules
        const response = await axios.get('/schedules');
        console.log('Schedules response:', response.data);

        // Handle the case where response.data might be an object instead of an array
        const schedules = Array.isArray(response.data) ? response.data : (response.data?.schedules || []);

        if (schedules && schedules.length > 0) {
          // Format the schedule data for display
          const formattedTasks = schedules.map(schedule => ({
            id: schedule._id,
            title: 'Custom Pickup Request',
            description: schedule.reason,
            address: schedule.location || 'Address not provided',
            wasteType: schedule.wasteType,
            date: schedule.date ? new Date(schedule.date).toLocaleDateString() : 'Date not provided',
            time: schedule.time || 'Time not provided',
            status: schedule.status || 'pending',
            userName: schedule.user?.firstName || 'Unknown User',
            userEmail: schedule.user?.email || '',
            assignedDriver: schedule.assignedDriver || null,
            // Pre-select the driver if already assigned
            ...(schedule.assignedDriver && { [schedule._id]: schedule.assignedDriver._id })
          }));
          setTasks(formattedTasks);
          
          // Pre-select drivers for tasks that already have assigned drivers
          const preselectedDrivers = {};
          schedules.forEach(schedule => {
            if (schedule.assignedDriver) {
              preselectedDrivers[schedule._id] = schedule.assignedDriver._id;
            }
          });
          setSelectedDriver(preselectedDrivers);
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        console.error('Error details:', err.response);
        setError(`Failed to fetch tasks: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Fetch drivers using the existing API function
    const fetchDrivers = async () => {
      try {
        const driverList = await getUsersByFilter('driver');
        setDrivers(driverList);
        console.log('Fetched drivers:', driverList);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        // Fallback to empty array if endpoint fails
        setDrivers([]);
      }
    };

    fetchTasks();
    fetchDrivers();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/schedules/${taskId}`, { status: newStatus });
      // Update the task in the local state
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
      console.error('Error details:', err.response);
      alert(`Failed to update task status: ${err.response?.data?.message || err.message}`);
    }
  };

  const assignDriverToTask = async (taskId) => {
    if (!selectedDriver[taskId]) {
      alert('Please select a driver');
      return;
    }

    try {
      await axios.put(`/schedules/${taskId}`, {
        assignedDriver: selectedDriver[taskId],
        status: 'approved'
      });

      // Update the task in the local state
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          const driver = drivers.find(d => d._id === selectedDriver[taskId]);
          return {
            ...task,
            assignedDriver: driver,
            status: 'approved'
          };
        }
        return task;
      }));

      alert('Driver assigned successfully');
    } catch (err) {
      console.error('Error assigning driver:', err);
      alert(`Failed to assign driver: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDriverChange = (taskId, driverId) => {
    setSelectedDriver({ ...selectedDriver, [taskId]: driverId });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow-md flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow-md flex justify-center items-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No custom pickup requests at this time</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded p-3 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{task.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'approved' ? 'bg-green-100 text-green-800' :
                  task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{task.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div><strong>Address:</strong> {task.address}</div>
                <div><strong>Waste Type:</strong> {task.wasteType}</div>
                <div><strong>Date:</strong> {new Date(task.date).toLocaleDateString()}</div>
                <div><strong>Time:</strong> {task.time}</div>
                <div className="md:col-span-2"><strong>Requested by:</strong> {task.userName} {task.userEmail && `(${task.userEmail})`}</div>
              </div>

              {task.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => updateTaskStatus(task.id, 'approved')}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'rejected')}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}

              {task.status === 'approved' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedDriver[task.id] || (task.assignedDriver && task.assignedDriver._id) || ''}
                      onChange={(e) => handleDriverChange(task.id, e.target.value)}
                    >
                      <option value="">Select a driver</option>
                      {drivers
                        .map(driver => (
                          <option key={driver._id} value={driver._id}>
                            {driver.firstName} {driver.lastName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => assignDriverToTask(task.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {task.status === 'assigned' && task.assignedDriver && (
                <div className="mt-3 p-2 bg-green-50 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Assigned to:</span> {task.assignedDriver.firstName} {task.assignedDriver.lastName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
