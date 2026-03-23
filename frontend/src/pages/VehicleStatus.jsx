import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

function VehicleStatus() {
  const role = 'driver';
  const userName = 'Driver Smith';

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} role={role} />
        <main className="p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-yellow-800">Vehicle Status</h1>
          <p>This is the Vehicle Status page for the driver.</p>
          {/* Add vehicle status details here */}
        </main>
      </div>
    </div>
  );
}

export default VehicleStatus;
