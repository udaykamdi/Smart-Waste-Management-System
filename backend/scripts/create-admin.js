const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garbage_management');
        console.log('Connected to MongoDB');

        // Create admin user
        const adminPassword = await bcrypt.hash('udaykamdi', 10);
        const adminUser = new User({
            name: 'Admin User',
            email: 'udaykamdi@gmail.com',
            password: adminPassword,
            mobile: '1234567890',
            role: 'admin'
        });

        // Save admin
        await User.deleteOne({ email: 'udaykamdi@gmail.com' }); // Remove existing admin if any
        await adminUser.save();
        console.log('Admin user created successfully');

        // Create driver user
        const driverPassword = await bcrypt.hash('test@100', 10);
        const driverUser = new User({
            name: 'Driver User',
            email: 'driver@gmail.com',
            password: driverPassword,
            mobile: '9876543210',
            role: 'driver'
        });

        // Save driver
        await User.deleteOne({ email: 'driver@gmail.com' }); // Remove existing driver if any
        await driverUser.save();
        console.log('Driver user created successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
}

createAdmin();
