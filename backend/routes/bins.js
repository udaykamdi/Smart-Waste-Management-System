const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Bin = require('../models/Bin');

// Get all bins
router.get('/', protect, async (req, res) => {
  try {
    const bins = await Bin.find().populate('assignedDriver', 'name email');
    res.json(bins);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create bin (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const bin = await Bin.create(req.body);
    res.status(201).json(bin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bin status (driver only)
router.put('/:id/status', protect, authorize('driver'), async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (!bin) {
      return res.status(404).json({ message: 'Bin not found' });
    }

    bin.status = req.body.status;
    bin.lastCleaned = new Date();
    await bin.save();

    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bin (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bin) {
      return res.status(404).json({ message: 'Bin not found' });
    }
    res.json(bin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bin (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id);
    if (!bin) {
      return res.status(404).json({ message: 'Bin not found' });
    }
    res.json({ message: 'Bin removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
