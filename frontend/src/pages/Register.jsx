
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Recycle, Trash2 } from "lucide-react";
import axios from '../config/axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    driverPin: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert("Please fill in both first and last name.");
      return;
    }
    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (
      formData.role === "driver" &&
      (!formData.driverPin ||
        formData.driverPin.length !== 4 ||
        !/^\d{4}$/.test(formData.driverPin))
    ) {
      alert("Driver PIN must be exactly 4 numeric digits.");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    // Prepare payload for backend
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      driverPin: formData.role === 'driver' ? formData.driverPin : undefined,
      // mobile: add if you collect it in the form
    };
    try {
  await axios.post('/auth/register', payload);
      alert('Registration successful! Welcome to Smart Waste Management.');
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
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

      {/* Right Side - Registration Form */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center bg-lime-50 p-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center mb-8"
        >
          <img src="/trash-bin1.gif" alt="Logo" className="h-14 mr-3" />
          <h1 className="text-3xl font-bold text-green-700">
            Smart Waste Management
          </h1>
        </motion.div>

        {/* Title */}
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-3xl font-semibold mb-8 text-gray-800"
          
        >
            Register 📝
        
        </motion.h2>
        

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6"
        >
          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

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
              name="email"
              type="email"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
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
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
            >
              Register As
            </label>
            <select
              id="role"
              name="role"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg bg-white text-gray-900 shadow-sm"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">👤 User</option>
              <option value="driver">🚛 Driver</option>
            </select>
          </div>

          {/* Driver PIN */}
          {formData.role === "driver" && (
            <div>
              <label
                htmlFor="driverPin"
                className="block text-gray-700 mb-2 font-semibold uppercase tracking-wide"
              >
                Driver PIN (4 digits)
              </label>
              <input
                id="driverPin"
                name="driverPin"
                type="password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition duration-200 text-lg text-center font-mono tracking-widest bg-white text-gray-900 shadow-sm"
                placeholder="Enter 4-digit PIN"
                value={formData.driverPin}
                onChange={handleInputChange}
                maxLength="4"
                pattern="[0-9]{4}"
                required={formData.role === "driver"}
              />
              <p className="text-xs text-gray-500 mt-1">
                This PIN will be used for driver authentication
              </p>
            </div>
          )}

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
            />
            <label
              htmlFor="agreeToTerms"
              className="text-sm text-gray-600 font-medium"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Terms & Conditions
              </a>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-300 shadow-lg text-lg"
          >
            🚀 Register
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}

export default Register;
