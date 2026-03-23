import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

function MyTasks() {
  const role = 'driver';
  const userName = 'Driver Smith';

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} role={role} />
        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-800">My Tasks</h1>
          <p>This is the My Tasks page for the user.</p>
          {/* Add task list or other components here */}
        </main>
      </div>
    </div>
  );
}

export default MyTasks;
