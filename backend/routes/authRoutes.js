const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const citizenUser = {
    id: '1',
    username: 'User',
    password: 'user', // In production, passwords should be hashed
    email: 'user@gmail.com',
    role: 'user'
};

const adminUser = {
    id: '2',
    username: 'admin',
    password: 'udaykamdi', // In production, passwords should be hashed
    email: 'udaykamdi@gmail.com',
    role: 'admin'
};

const driverUser = {
    id: '3',
    username: 'driver',
    password: 'driver', // In production, passwords should be hashed
    email: 'driver@gmail.com',
    role: 'driver'
};

// login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    let user = null;

    if (email === citizenUser.email && password === citizenUser.password) {
        user = citizenUser;
    } else if (email === adminUser.email && password === adminUser.password) {
        user = adminUser;
    } else if (email === driverUser.email && password === driverUser.password) {
        user = driverUser;
    }

    if (user) {
        res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token: 'mock-jwt-token' // Replace with real token in production
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

module.exports = router;


// Get current user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user information (admin only)
router.put('/users/:id', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const { id } = req.params;
        const { area } = req.body;

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's area
        if (area !== undefined) {
            user.area = area;
        }

        // Save the updated user
        await user.save();

        // Return the updated user without the password
        const updatedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            area: user.area,
            phone: user.phone,
            address: user.address,
            photo: user.photo,
            status: user.status
        };

        res.json({ user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
