const mongoose = require('mongoose');
const Bin = require('../models/Bin');
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/yourdbname', { // replace 'yourdbname' with your actual database name
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const createSampleBin = async () => {
    await connectDB();

    const driver = await User.findOne({ email: 'driver@gmail.com' });
    if (!driver) {
        console.log('Driver not found');
        return;
    }

    const bin = new Bin({
        binName: 'Sample Bin',
        location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716] // Sample coordinates
        },
        type: 'medium',
        assignedDriver: driver._id,
        cleaningPeriod: 'daily',
        tips: 'Keep the bin clean.',
        status: 'pending'
    });

    await bin.save();
    console.log('Sample bin created and assigned to driver:', bin);
    mongoose.connection.close();
};

createSampleBin();
