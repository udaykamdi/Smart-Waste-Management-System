import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import axios from '../config/axios';

function Tasks() {
  const role = 'driver';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get user from localStorage (set at login/profile update)
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const userName = storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName}` : 'Driver';

  // State for completed tasks
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed tasks on mount
  useEffect(() => {
    async function fetchCompletedTasks() {
      try {
        // Get user profile to fetch area information
        const res = await axios.get('/profile');
        const userData = res.data.user;

        // If user has an assigned area, fetch completed tasks for that area
        if (userData.area) {
          // In a real implementation, this would fetch from the backend
          // For now, we'll use localStorage to simulate completed tasks
          const storedCompletedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');

          // Filter tasks for the current user
          const userCompletedTasks = storedCompletedTasks.filter(
            task => task.driverId === userData._id
          );

          setCompletedTasks(userCompletedTasks);
        }
      } catch (err) {
        console.error('Failed to fetch completed tasks:', err);
        setCompletedTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletedTasks();
  }, []);

  return (
    <div className="flex min-h-screen bg-yellow-50" key="tasks-page">
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
          <h1 className="ml-4 text-xl font-bold text-white">Completed Tasks</h1>
        </div>
        <main className="p-6 overflow-auto">

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading completed tasks...</div>
            </div>
          ) : completedTasks.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subarea
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedTasks.map((task, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.area}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.subarea}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.completedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-500 text-lg">No completed tasks found</div>
              <p className="text-gray-400 mt-2">Your completed tasks will appear here once you mark them as done in the Driver Dashboard.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Tasks;
