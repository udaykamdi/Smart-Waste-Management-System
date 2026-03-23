import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import axios from '../config/axios';
import { updateComplaintStatus } from '../services/api';

function ComplaintManagement() {
  const role = 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userName = 'Admin User';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const statusColors = {
    pending: 'bg-red-100 text-red-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedComplaint) return;

    setUpdatingStatus(true);
    try {
      await updateComplaintStatus(selectedComplaint._id, newStatus);
      // Update the complaint in the local state
      setComplaints(complaints.map(c =>
        c._id === selectedComplaint._id ? { ...c, status: newStatus } : c
      ));
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update complaint status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

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
          <h1 className="ml-4 text-xl font-bold text-white">Complaint Management</h1>
        </div>
        <main className="p-8 overflow-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading complaints...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {complaints.length > 0 ? complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Complaint #{complaint._id.slice(-6)}</h2>
                    <p className="text-gray-800 mb-2">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>Reported by: {complaint.user?.name || complaint.user?.email || 'Unknown User'}</span>
                      {complaint.bin && <span>Bin: {complaint.bin.binName}</span>}
                      <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-semibold mt-2 ${statusColors[complaint.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {complaint.status || 'pending'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="mt-4 md:mt-0 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition duration-300 font-semibold shadow-md"
                  >
                    View Details
                  </button>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No complaints found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal for Complaint Details */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complaint Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complaint ID</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedComplaint._id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">
                    {(() => {
                      // Extract location from description if present
                      const description = selectedComplaint.description || '';
                      const locationMatch = description.match(/- Location:\s*(.+)$/);
                      if (locationMatch) {
                        return locationMatch[1].trim();
                      }
                      // Fallback to bin location if available
                      return selectedComplaint.bin ? `${selectedComplaint.bin.binName} - ${selectedComplaint.bin.location || 'Location not specified'}` : 'No location specified';
                    })()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                  <p className="text-gray-900">
                    {selectedComplaint.user?.firstName && selectedComplaint.user?.lastName
                      ? `${selectedComplaint.user.firstName} ${selectedComplaint.user.lastName}`
                      : selectedComplaint.user?.email || 'Unknown User'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      // Clean description by removing location part
                      const description = selectedComplaint.description || '';
                      const locationMatch = description.match(/- Location:\s*(.+)$/);
                      if (locationMatch) {
                        return description.replace(/- Location:\s*(.+)$/, '').trim();
                      }
                      return description;
                    })()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Submitted</label>
                  <p className="text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'in-progress', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updatingStatus}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedComplaint.status === status
                            ? `${statusColors[status]} border-2 border-current`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  {updatingStatus && (
                    <p className="text-sm text-blue-600 mt-2">Updating status...</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintManagement;
