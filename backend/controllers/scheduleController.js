
const CustomSchedule = require('../models/CustomSchedule');

// @desc    Create a new custom schedule request
// @route   POST /api/schedules/custom
// @access  Private (User)
exports.createCustomSchedule = async (req, res) => {
    const { user, location, date, time, wasteType, reason } = req.body;

    try {
        const newSchedule = new CustomSchedule({
            user,
            location,
            date,
            time,
            wasteType,
            reason
        });

        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        console.error('Error creating custom schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all custom schedule requests
// @route   GET /api/schedules/custom
// @access  Private (Admin)
exports.getCustomSchedules = async (req, res) => {
    try {
        // Populate user details, selecting only name and email
        const schedules = await CustomSchedule.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching custom schedules:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
