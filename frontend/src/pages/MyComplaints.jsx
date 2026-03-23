import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import { getMyComplaints } from '../services/api';

function MyComplaints() {
  const role = 'user';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        // Debug: Log localStorage contents
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log('Token from localStorage:', token);
        console.log('User from localStorage:', storedUser);
        
        if (!storedUser || !storedUser.id) {
          console.error('User not logged in');
          setLoading(false);
          return;
        }
        const data = await getMyComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="ml-4 text-xl font-bold text-white">My Complaints</h1>
        </div>
        <main className="p-8 overflow-auto">

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg">No complaints found.</p>
              <p className="text-gray-500 mt-2">You haven't submitted any complaints yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        Complaint #{complaint._id.slice(-6)}
                      </h4>
                      <p className="text-gray-600 mb-2">{complaint.description}</p>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  {complaint.bin && (
                    <div className="text-sm text-gray-600">
                      <strong>Bin:</strong> {complaint.bin.binName} - {complaint.bin.location}
                    </div>
                  )}
                  {complaint.resolvedAt && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Resolved on:</strong> {new Date(complaint.resolvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyComplaints;
