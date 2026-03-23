const mongoose = require('mongoose');
const Bin = require('../models/Bin');
require('dotenv').config({ path: '../.env' });

async function createSampleBins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garbage_management');
        console.log('Connected to MongoDB');

        // Clear existing bins
        await Bin.deleteMany({});

        const sampleBins = [
            {
                binName: 'Bin-101',
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850] // Example coordinates
                },
                type: 'low',
                cleaningPeriod: 'daily',
                status: 'pending',
                tips: 'Regular residential area bin'
            },
            {
                binName: 'Bin-102',
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3851] // Example coordinates
                },
                type: 'medium',
                cleaningPeriod: 'weekly',
                status: 'pending',
                tips: 'Near shopping complex'
            },
            {
                binName: 'Bin-103',
                location: {
                    type: 'Point',
                    coordinates: [78.4868, 17.3852] // Example coordinates
                },
                type: 'high',
                cleaningPeriod: 'daily',
                status: 'pending',
                tips: 'High traffic area, needs frequent cleaning'
            }
        ];

        await Bin.insertMany(sampleBins);
        console.log('Sample bins created successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error creating sample bins:', error);
        process.exit(1);
    }
}

createSampleBins();
