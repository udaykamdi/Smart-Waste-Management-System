
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Schedule = require('../models/Schedule');

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ createdAt: -1 });
    
    // Manually populate user information
    const populatedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        let populatedSchedule = schedule.toObject();
        
        if (mongoose.Types.ObjectId.isValid(schedule.user)) {
          // If user is a valid ObjectId, populate it
          const user = await mongoose.model('User').findById(schedule.user, 'firstName lastName email');
          if (user) {
            populatedSchedule.user = user;
          }
        }
        
        return populatedSchedule;
      })
    );
    
    res.status(200).json(populatedSchedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @route   GET /api/schedules/my
// @desc    Get current user's schedules
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    // Convert user ID to ObjectId if possible
    let userId = req.user.id;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new mongoose.Types.ObjectId(userId);
    }

    const schedules = await Schedule.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @route   GET /api/schedules/assigned
// @desc    Get schedules assigned to current driver
// @access  Private (Driver)
router.get('/assigned', protect, authorize('driver'), async (req, res) => {
  try {
    // Convert user ID to ObjectId if possible
    let userId = req.user.id;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new mongoose.Types.ObjectId(userId);
    }

    // Get schedules assigned to this driver
    const schedules = await Schedule.find({ assignedDriver: userId })
      .sort({ createdAt: -1 });

    // Manually populate user information for each schedule
    const populatedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        let populatedSchedule = schedule.toObject();

        if (mongoose.Types.ObjectId.isValid(schedule.user)) {
          // If user is a valid ObjectId, populate it
          const user = await mongoose.model('User').findById(schedule.user, 'firstName lastName email');
          if (user) {
            populatedSchedule.user = user;
          }
        }

        // Also populate the assignedDriver if it exists
        if (mongoose.Types.ObjectId.isValid(schedule.assignedDriver)) {
          const driver = await mongoose.model('User').findById(schedule.assignedDriver, 'firstName lastName email');
          if (driver) {
            populatedSchedule.assignedDriver = driver;
          }
        }

        return populatedSchedule;
      })
    );

    res.status(200).json(populatedSchedules);
  } catch (error) {
    console.error('Error fetching assigned schedules:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @route   POST /api/schedules
// @desc    Create a custom pickup schedule request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, time, reason, wasteType, location, address } = req.body;

    if (!date || !time || !reason || !wasteType || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Convert user ID to ObjectId if possible
    let userId = req.user.id;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    
    const newSchedule = new Schedule({
      user: userId,
      location: address, // Use address instead of location
      date,
      time,
      reason,
      wasteType
    });

    await newSchedule.save();

    res.status(201).json({
      message: 'Schedule request created successfully',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update schedule status
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin', 'driver'), async (req, res) => {
  try {
    const { status, assignedDriver } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id, 
      { status, updatedAt: new Date(), ...(assignedDriver && { assignedDriver }) }, 
      { new: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.status(200).json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
