const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Bin = require('../models/Bin');

async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garbage_management');
        console.log('Connected to MongoDB');

        // Create admin user
        const adminPassword = await bcrypt.hash('udaykamdi', 10);
        const adminUser = new User({
            name: 'Admin',
            email: 'udaykamdi@gmail.com',
            password: adminPassword,
            mobile: '1234567890',
            role: 'admin'
        });

        // Create driver user
        const driverPassword = await bcrypt.hash('test@100', 10);
        const driverUser = new User({
            name: 'Driver',
            email: 'driver@gmail.com',
            password: driverPassword,
            mobile: '9876543210',
            role: 'driver'
        });

        // Save users
        await User.deleteMany({}); // Clear existing users
        await adminUser.save();
        await driverUser.save();
        console.log('Users created successfully');

        // Create sample bins
        const bins = [
            {
                binName: 'CMBT',
                location: {
                    coordinates: [80.2707, 13.0827] // Chennai coordinates
                },
                type: 'high',
                assignedDriver: driverUser._id,
                cleaningPeriod: 'daily',
                tips: 'Near the main entrance'
            },
            {
                binName: 'Anna Nagar',
                location: {
                    coordinates: [80.2091, 13.0850]
                },
                type: 'medium',
                assignedDriver: driverUser._id,
                cleaningPeriod: 'daily',
                tips: 'Behind the park'
            }
        ];

        // Save bins
        await Bin.deleteMany({}); // Clear existing bins
        await Bin.insertMany(bins);
        console.log('Bins created successfully');

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
