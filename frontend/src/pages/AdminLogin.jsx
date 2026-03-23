import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin as adminLoginApi } from "../services/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      console.log('AdminLogin - Attempting admin login with email:', email);
      await adminLoginApi(email, password);
      console.log('AdminLogin - Admin login successful, navigating to admin dashboard');
      navigate("/admin/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-blue-900/30"></div>
        <div className="relative z-10 flex flex-col items-center p-12 text-white animate-fade-in">
          <img
            src="/admin.jpg"
            alt="Admin Dashboard"
            className="max-w-lg drop-shadow-2xl mb-8 rounded-lg"
          />
          <h1 className="text-5xl font-extrabold mb-6 text-center">Welcome Admin</h1>
          <p className="text-xl text-center leading-relaxed">Manage your smart waste system efficiently and effectively.</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center bg-white p-8 md:p-12 shadow-lg md:shadow-none">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="text-red-600 font-semibold mb-6 bg-red-50 p-4 rounded-lg border border-red-200 animate-shake">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-3 font-semibold text-lg">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-3 font-semibold text-lg">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
