
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import axios from "../config/axios";

function DriverProfile() {
  const role = "driver";
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

  // Load profile from localStorage on mount
  useEffect(() => {
    // First load from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    
    // Create a default driver profile if none exists
    const defaultProfile = {
      firstName: 'Driver',
      lastName: 'User',
      email: 'driver@example.com',
      role: 'driver',
      phone: '',
      address: '',
      photo: '',
    };
    
    // Set profile from localStorage or default
    setProfile({
      firstName: storedUser.firstName || defaultProfile.firstName,
      lastName: storedUser.lastName || defaultProfile.lastName,
      email: storedUser.email || defaultProfile.email,
      role: storedUser.role || defaultProfile.role,
      phone: storedUser.phone || defaultProfile.phone,
      address: storedUser.address || defaultProfile.address,
      photo: storedUser.photo || defaultProfile.photo,
    });
    
    // Update localStorage with default profile if empty
    if (!storedUser.firstName) {
      localStorage.setItem('user', JSON.stringify(defaultProfile));
    }
    
    // Then try to fetch fresh profile from backend
    async function fetchProfile() {
      try {
        const res = await axios.get('/profile');
        setProfile(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
        // We already loaded from localStorage, so no need to do anything here
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
      // Only send editable fields
      const { firstName, lastName, phone, address, photo } = profile;
      console.log('Saving profile data:', { firstName, lastName, phone, address, photo: photo ? '[Photo data present]' : '[No photo]' });
      
      const res = await axios.put('/profile', { firstName, lastName, phone, address, photo });
      console.log('Profile save response:', res.data);
      
      // Update the profile state with the response from the server
      setProfile(res.data.user);
      
      // Update localStorage with the latest profile data
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Show success message
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      
      // Exit editing mode
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      console.error('Error response:', err.response);
      alert(`Failed to save profile: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen" key="profile-page">
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
          <h1 className="ml-4 text-xl font-bold text-white">Driver Profile</h1>
        </div>
        <main className="p-8 overflow-auto">

          {/* Profile Layout */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left: Photo */}
              <div className="flex flex-col items-center">
                <img
                  src={profile.photo || "/default-avatar.png"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-orange-500 shadow"
                />
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="mt-4"
                  />
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
                      value={profile.firstName || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
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
                      value={profile.lastName || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.lastName}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{profile.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
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
                      value={profile.address || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
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
                  <p className="text-gray-900 text-lg">{profile.role}</p>
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
                    : "bg-orange-500 hover:bg-orange-600"
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

export default  DriverProfile;
