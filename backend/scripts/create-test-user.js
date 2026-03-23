const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garbage_management');
        console.log('Connected to MongoDB');

        // Create test user
        const userPassword = await bcrypt.hash('test@100', 10);
        const testUser = new User({
            name: 'Test User',
            email: 'user@gmail.com',
            password: userPassword,
            mobile: '9876543210',
            role: 'user'
        });

        // Save user
        await User.deleteOne({ email: 'user@gmail.com' }); // Remove existing user if any
        await testUser.save();
        console.log('Test user created successfully');

        // Verify user
        const savedUser = await User.findOne({ email: 'user@gmail.com' });
        console.log('Verified user in database:', {
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            id: savedUser._id
        });

        // Test password
        const isPasswordValid = await bcrypt.compare('test@100', savedUser.password);
        console.log('Password verification:', isPasswordValid);

        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
}

createTestUser();
