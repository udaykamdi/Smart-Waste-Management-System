const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Update user profile
router.put('/', protect, async (req, res) => {
  try {
    console.log('Profile update request received:', req.body);

    // Special handling for mock admin user
    if (req.user.id === '2' && req.user.role === 'admin') {
      // Just return success for mock admin without updating database
      const { firstName, lastName, phone, address, photo } = req.body;
      return res.json({ 
        user: {
          _id: '2',
          firstName: firstName || 'Admin',
          lastName: lastName || 'User',
          email: 'udaykamdi@gmail.com',
          role: 'admin',
          phone: phone || '',
          address: address || '',
          photo: photo || ''
        }
      });
    }

    // Find user by ID - handle both string and ObjectId formats
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
    } catch (err) {
      userId = req.user.id;
    }

    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, phone, address, photo } = req.body;
    const updateFields = { firstName, lastName, phone, address, photo };
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    console.log('Updating user with fields:', updateFields);

    // Update user fields
    Object.assign(user, updateFields);
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

// Get current user profile
router.get('/', protect, async (req, res) => {
  try {
    console.log('Profile route - User from token:', req.user);
    console.log('Profile route - User ID:', req.user.id);
    console.log('Profile route - User ID type:', typeof req.user.id);
    // Special handling for mock admin user
    if (req.user.id === '2' && req.user.role === 'admin') {
      // Return mock admin data
      return res.json({ 
        user: {
          _id: '2',
          firstName: 'Admin',
          lastName: 'User',
          email: 'udaykamdi@gmail.com',
          role: 'admin',
          phone: '',
          address: '',
          photo: ''
        }
      });
    }
    
    // Find user by ID
    let user;
    try {
      // Try to find user by ObjectId first
      const mongoose = require('mongoose');
      console.log('Profile route - Is valid ObjectId:', mongoose.Types.ObjectId.isValid(req.user.id));
      if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        console.log('Profile route - Finding user by ObjectId');
        user = await User.findById(req.user.id).select('-password');
      } else {
        // If ID is not a valid ObjectId, try to find by string ID
        console.log('Profile route - Finding user by string ID');
        user = await User.findOne({ _id: req.user.id }).select('-password');
      }
      console.log('Profile route - Found user:', user);
    } catch (err) {
      console.error('Profile route - Error finding user:', err);
      user = null;
    }

    if (!user) {
      console.error('Profile route - User not found with ID:', req.user.id);
      console.error('Profile route - User ID type:', typeof req.user.id);
      console.error('Profile route - Is valid ObjectId:', require('mongoose').Types.ObjectId.isValid(req.user.id));
      return res.status(404).json({ message: 'User not found' });
    }
    // Create a new user object with the id field
    const userResponse = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      photo: user.photo || '',
      ...(user.area ? { area: user.area } : {}),
      ...(user.role === 'driver' ? {
        status: user.status || 'inactive',
        driverPin: user.driverPin
      } : {})
    };
    
    console.log('Profile route - Returning user data:', userResponse);
    res.json({ user: userResponse });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
