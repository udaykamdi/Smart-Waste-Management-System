const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Update user profile
router.put('/', protect, async (req, res) => {
  try {
    console.log('Profile update request received:', req.body);

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
    // Find user by ID
    let user;
    try {
      // Try to find user by ObjectId first
      user = await User.findById(req.user.id).select('-password');
    } catch (err) {
      // If ID is not a valid ObjectId, try to find by string ID
      user = await User.findOne({ _id: req.user.id }).select('-password');
    }

    if (!user) {
      console.error('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;