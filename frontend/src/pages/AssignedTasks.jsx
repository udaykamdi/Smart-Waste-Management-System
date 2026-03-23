import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

function AssignedTasks() {
  const role = 'driver';
  const userName = 'Driver Smith';

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Garbage Collection - Sector A',
      description: 'Collect garbage from residential area Sector A',
      status: 'In Progress',
      priority: 'High',
      estimatedTime: '2 hours',
      location: 'Sector A, Block 5'
    },
    {
      id: 2,
      title: 'Bin Emptying - Commercial Zone',
      description: 'Empty commercial waste bins in downtown area',
      status: 'Pending',
      priority: 'Medium',
      estimatedTime: '1.5 hours',
      location: 'Commercial Zone, Street 12'
    },
    {
      id: 3,
      title: 'Special Collection - Hospital',
      description: 'Collect medical waste from City Hospital',
      status: 'Scheduled',
      priority: 'High',
      estimatedTime: '45 minutes',
      location: 'City Hospital, Ward 3'
    }
  ]);

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} role={role} />
        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-800">Assigned Tasks</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-800 text-lg">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Est. Time:</span>
                    <span>{task.estimatedTime}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Location:</span>
                    <span>{task.location}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'Completed')}
                      className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-110"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
              No assigned tasks at the moment.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AssignedTasks;
