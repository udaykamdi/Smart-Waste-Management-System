import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import axios from "../config/axios";
import { useParams, useNavigate } from "react-router-dom";

function AdminViewDriverProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`/auth/users`);
        const driver = res.data.find(u => u._id === id);
        setProfile(driver);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <div className="p-8 text-red-600">Driver not found.</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Header role="admin" />
        <main className="p-8 overflow-auto">
          <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline">&larr; Back</button>
          <h3 className="text-3xl font-bold mb-8 text-gray-900">Driver Profile</h3>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col items-center">
                <img
                  src={profile.photo || "/default-avatar.png"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-600 shadow"
                />
              </div>
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">First Name</label>
                  <p className="text-gray-900 text-lg">{profile.firstName}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Last Name</label>
                  <p className="text-gray-900 text-lg">{profile.lastName}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <p className="text-gray-900 text-lg">{profile.email}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                  <p className="text-gray-900 text-lg">{profile.phone}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Address</label>
                  <p className="text-gray-900 text-lg">{profile.address}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <p className="text-gray-900 text-lg">{profile.status}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminViewDriverProfile;
