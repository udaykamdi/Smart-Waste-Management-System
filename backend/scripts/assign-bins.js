const mongoose = require('mongoose');
const Bin = require('../models/Bin');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function assignBins() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garbage_management');
        console.log('Connected to MongoDB');

        // Get the driver user
        const driver = await User.findOne({ email: 'driver@gmail.com' });
        if (!driver) {
            throw new Error('Driver not found');
        }

        // Create sample bins
        const sampleBins = [
            {
                binName: 'Bin A1',
                type: 'low',
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850] // Hyderabad coordinates
                },
                status: 'pending',
                cleaningPeriod: 'daily',
                assignedDriver: driver._id,
                tips: 'Located near the main entrance'
            },
            {
                binName: 'Bin B2',
                type: 'medium',
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3851]
                },
                status: 'pending',
                cleaningPeriod: 'weekly',
                assignedDriver: driver._id,
                tips: 'Behind the parking area'
            },
            {
                binName: 'Bin C3',
                type: 'high',
                location: {
                    type: 'Point',
                    coordinates: [78.4868, 17.3852]
                },
                status: 'pending',
                cleaningPeriod: 'monthly',
                assignedDriver: driver._id,
                tips: 'Near the food court'
            }
        ];

        // Clear existing bins for this driver
        await Bin.deleteMany({ assignedDriver: driver._id });

        // Insert new bins
        await Bin.insertMany(sampleBins);
        console.log('Sample bins created and assigned to driver successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error assigning bins:', error);
        process.exit(1);
    }
}

assignBins();
