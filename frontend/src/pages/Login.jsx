import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Leaf, Recycle, Trash2 } from "lucide-react";
import { login } from "../services/api";
import Chatbot from "../components/Chatbot";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      console.log('Login - Attempting login with email:', email);
      const user = await login(email, password);
      console.log('Login - Login successful, user data:', user);
      console.log('Login - User role:', user.role);
      console.log('Login - Token from localStorage:', localStorage.getItem('token'));
      if (user.role === "driver") {
        navigate("/driver/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Please check your credentials.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex">
          {/* Left Side - Animated Background */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-green-700 items-center justify-center relative overflow-hidden">
            {/* Background video overlay */}
            <video
              src="/waste3.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="object-cover h-full w-full opacity-50 absolute inset-0"
            />

            {/* Floating icons */}
            <motion.div
              className="absolute"
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "20%", left: "15%" }}
            >
              <Leaf className="text-white w-12 h-12 opacity-90" />
            </motion.div>

            <motion.div
              className="absolute"
              animate={{ y: [0, -40, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ bottom: "25%", left: "30%" }}
            >
              <Recycle className="text-lime-300 w-14 h-14 opacity-90" />
            </motion.div>

            <motion.div
              className="absolute"
              animate={{ y: [0, -25, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "40%", right: "20%" }}
            >
              <Trash2 className="text-green-100 w-12 h-12 opacity-90" />
            </motion.div>

            {/* Info Overlay */}
            <div className="absolute text-white p-10 max-w-md z-10 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-4xl font-extrabold mb-4 drop-shadow-lg"
              >
                Smart Waste Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-lg leading-relaxed text-green-100 drop-shadow"
              >
                Turning waste into a cleaner, greener tomorrow ♻️
              </motion.p>
            </div>
          </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center bg-lime-50 p-12">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <img src="/trash-bin1.gif" alt="Logo" className="h-14 mr-3" />
          <h1 className="text-3xl font-bold text-green-700">
            Smart Waste Management
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Welcome Back! 👋
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.042.168-2.042.475-3.001m1.45-1.45A9.969 9.969 0 0112 5c5.523 0 10 4.477 10 10 0 1.042-.168 2.042-.475 3.001m-1.45 1.45L4.5 4.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 font-medium"
              >
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-300 shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "🚀 Login"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-sm text-gray-600 mt-6"
        >
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-green-600 font-medium hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
      <Chatbot />
    </div>
    </>
  );
}

export default Login;
