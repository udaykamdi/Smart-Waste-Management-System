const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// Get all complaints
router.get('/', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('bin', 'binName location');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user complaints
router.get('/my', protect, async (req, res) => {
  try {
    // Convert user ID to ObjectId if possible
    let userId = req.user.id;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    
    const complaints = await Complaint.find({ user: userId })
      .populate('bin', 'binName location');
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create complaint
router.post('/', protect, async (req, res) => {
  try {
    // Convert user ID to ObjectId if possible
    let userId = req.user.id;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    
    const complaint = await Complaint.create({
      ...req.body,
      user: userId
    });
    res.status(201).json(complaint);
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = req.body.status;
    if (req.body.status === 'completed') {
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
