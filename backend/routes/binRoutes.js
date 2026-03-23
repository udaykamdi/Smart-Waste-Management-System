const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const { protect, authorize } = require('../middleware/auth');

// Get all bins (accessible by all authenticated users)
router.get('/', protect, async (req, res) => {
    try {
        const bins = await Bin.find().select('binName location type cleaningPeriod lastCleaned');
        res.json(bins);
    } catch (err) {
        console.error('Error fetching bins:', err);
        res.status(500).json({ message: 'Error fetching bins' });
    }
});

// Get bins assigned to driver
router.get('/assigned', protect, authorize('driver'), async (req, res) => {
    try {
        const bins = await Bin.find({ assignedDriver: req.user._id });
        res.json(bins);
    } catch (err) {
        console.error('Error fetching assigned bins:', err);
        res.status(500).json({ message: 'Error fetching assigned bins' });
    }
});

// Update bin status (driver only)
router.put('/:id/status', protect, authorize('driver'), async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }

        if (bin.assignedDriver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this bin' });
        }

        bin.status = req.body.status;
        if (req.body.status === 'completed') {
            bin.lastCleaned = new Date();
        }

        await bin.save();
        res.json(bin);
    } catch (err) {
        console.error('Error updating bin status:', err);
        res.status(500).json({ message: 'Error updating bin status' });
    }
});

// Create bin (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const bin = new Bin(req.body);
        await bin.save();
        res.status(201).json(bin);
    } catch (err) {
        console.error('Error creating bin:', err);
        res.status(500).json({ message: 'Error creating bin' });
    }
});

// Update bin (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }
        res.json(bin);
    } catch (err) {
        console.error('Error updating bin:', err);
        res.status(500).json({ message: 'Error updating bin' });
    }
});

// Delete bin (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const bin = await Bin.findByIdAndDelete(req.params.id);
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }
        res.json({ message: 'Bin deleted successfully' });
    } catch (err) {
        console.error('Error deleting bin:', err);
        res.status(500).json({ message: 'Error deleting bin' });
    }
});

module.exports = router;
