
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import axios from "../config/axios";

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    photo: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = profile.role || 'user';

  // Fetch profile from backend on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        // Debug: Log localStorage contents
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let storedUser;
        
        console.log('Profile - Token from localStorage:', token ? 'Token exists' : 'No token');
        console.log('Profile - User string from localStorage:', userStr ? 'User string exists' : 'No user string');
        
        try {
          storedUser = userStr ? JSON.parse(userStr) : null;
          console.log('Profile - Parsed user from localStorage:', storedUser);
        } catch (e) {
          console.error('Profile - Error parsing user from localStorage:', e);
          storedUser = null;
        }

        // First try to get user data from localStorage (for immediate display)
        if (storedUser && (storedUser.firstName || storedUser.lastName)) {
          console.log('Profile - Setting profile from localStorage data');
          setProfile({
            firstName: storedUser.firstName || '',
            lastName: storedUser.lastName || '',
            email: storedUser.email || '',
            role: storedUser.role || 'user',
            phone: storedUser.phone || '',
            address: storedUser.address || '',
            photo: storedUser.photo || '',
          });
        } else {
          console.log('Profile - No valid user data in localStorage');
        }

        // Check if token exists
        if (!token) {
          console.error('Profile - No authentication token found');
          throw new Error('No authentication token found');
        }

        // Use the correct API endpoint with auth header (axios interceptor will add the token)
        console.log('Profile - Making request to /profile endpoint');
        let res;
        try {
          res = await axios.get('/profile');
          console.log('Profile - Received response from /profile endpoint:', res.status);
        } catch (error) {
          console.error('Profile - Error fetching profile:', error);
          if (error.response) {
            console.error('Profile - Error response status:', error.response.status);
            console.error('Profile - Error response data:', error.response.data);
          }
          throw error;
        }

        // Update state with the response from database
        const user = res.data.user;
        console.log('Profile - Received response data:', res.data);
        console.log('Profile - User from API:', user);
        console.log('Profile - User ID from API:', user ? user.id : 'No user');
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          role: user.role || 'user',
          phone: user.phone || '',
          address: user.address || '',
          photo: user.photo || '',
        });

        // Update localStorage with the latest user data from database
        console.log('Profile - Updating localStorage with user data from API');
        console.log('Profile - User data being saved to localStorage:', user);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Profile - User data saved to localStorage');
      } catch (err) {
        console.error('Profile - Error fetching profile:', err);
        // If API fails, make sure we at least have the localStorage data
        console.log('Profile - API failed, checking if we have localStorage data');
        const userStr = localStorage.getItem('user');
        let storedUser;
        
        try {
          storedUser = userStr ? JSON.parse(userStr) : null;
          console.log('Profile - Parsed user from localStorage in error handler:', storedUser);
        } catch (e) {
          console.error('Profile - Error parsing user from localStorage in error handler:', e);
          storedUser = null;
        }
        
        if (!storedUser || !storedUser.firstName) {
          // If we don't even have basic data in localStorage, set defaults
          console.log('Profile - No valid user data in localStorage, setting defaults');
          console.log('Profile - Setting default profile values');
          setProfile({
            firstName: '',
            lastName: '',
            email: '',
            role: 'user',
            phone: '',
            address: '',
            photo: '',
          });
        } else {
          console.log('Profile - Using localStorage data for profile');
          setProfile({
            firstName: storedUser.firstName || '',
            lastName: storedUser.lastName || '',
            email: storedUser.email || '',
            role: storedUser.role || 'user',
            phone: storedUser.phone || '',
            address: storedUser.address || '',
            photo: storedUser.photo || '',
          });
        }
      } finally {
        console.log('Profile - Setting loading to false');
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Set authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Only send editable fields
      const { firstName, lastName, phone, address, photo } = profile;
      const res = await axios.put('/profile', { firstName, lastName, phone, address, photo }, config);

      // Update local state with the response
      const updatedUser = res.data.user;
      setProfile({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        email: updatedUser.email || '',
        role: updatedUser.role || 'user',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        photo: updatedUser.photo || '',
      });

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile.');
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
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
            <h1 className="ml-4 text-xl font-bold text-white">User Profile</h1>
          </div>
          <main className="p-8 overflow-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading profile...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
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
          <h1 className="ml-4 text-xl font-bold text-white">User Profile</h1>
        </div>
        <main className="p-8 overflow-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">User Profile</h3>

          {/* Profile Layout */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Photo */}
              <div className="flex flex-col items-center">
                <img
                  src={profile.photo || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-600 shadow"
                />
                {isEditing && (
                  <div className="mt-4">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg cursor-pointer transition duration-300">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.firstName}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.lastName}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 text-lg">{profile.email}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.phone}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.address}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Role
                  </label>
                  <p className="text-gray-900 text-lg capitalize">{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={toggleEdit}
                className={`${
                  isEditing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white py-3 px-6 rounded-lg transition duration-300 font-semibold shadow-md`}
              >
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Success Message */}
      {showMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          ✅ Profile saved successfully!
        </div>
      )}
    </div>
  );
}

export default Profile;

