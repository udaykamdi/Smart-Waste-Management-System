
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const User = require('./models/User'); // User model
const Complaint = require('./models/Complaint'); // Complaint model
const Bin = require('./models/Bin'); // Bin model
const CustomSchedule = require('./models/CustomSchedule'); // Import CustomSchedule model

const profileRoutes = require('./routes/profile');
const scheduleRoutes = require('./routes/scheduleRoutes');
const authRoutes = require('./routes/authRoutes');
const generalAuthRoutes = require('./routes/auth');
const binRoutes = require('./routes/binRoutes');
const { protect } = require('./middleware/auth');
const Schedule = require('./models/Schedule');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/auth/admin', authRoutes);
app.use('/api/auth', generalAuthRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bins', binRoutes);

// Connect to MongoDB
mongoose.connect('process.env.MONGO_URI', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, driverPin } = req.body;

    // Validate input (only require firstName, lastName, email, password, role, driverPin if driver)
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (role === 'driver' && (!driverPin || driverPin.length !== 4)) {
      return res.status(400).json({ message: 'Driver PIN must be exactly 4 digits' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      driverPin: role === 'driver' ? driverPin : undefined,
      phone: '',
      address: '',
      photo: ''
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error:', error); // Log detailed error
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const userId = user._id.toString();
    console.log('Login route - User ID:', userId);
    console.log('Login route - User ID type:', typeof userId);
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    console.log('Login route - JWT Secret:', jwtSecret);
    const token = jwt.sign({ id: userId, role: user.role }, jwtSecret, { expiresIn: '24h' });
    console.log('Login route - Generated token:', token);
    console.log('Login route - Token length:', token.length);
    
    // Return complete user profile
    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || '',
        area: user.area || '',
        ...(user.role === 'driver' ? { 
          status: user.status || 'inactive',
          driverPin: user.driverPin
        } : {})
      }
    };
    console.log('Login route - Response data:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Admin Login route
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login route - Attempting login with email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      console.log('Admin login route - Admin user not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Admin login route - Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    // Use mock token for development
    const token = 'mock-jwt-token';
    console.log('Admin login route - Using mock token for development');

    // Return complete user profile
    const response = {
      message: 'Admin login successful',
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        photo: user.photo || '',
        area: user.area || ''
      }
    };
    console.log('Admin login route - Response data:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Admin login route - Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Create Complaint
app.post('/api/complaints', async (req, res) => {
    try {
        const { user, bin, description, suggestedBin } = req.body;
        if (!user || !description || (!bin && !suggestedBin)) {
            return res.status(400).json({ message: 'User, description, and either bin or suggestedBin are required' });
        }
        const newComplaint = new Complaint({
            user,
            bin: bin || undefined,
            description,
            suggestedBin: suggestedBin || false
        });
        await newComplaint.save();
        res.status(201).json({
            message: 'Complaint registered successfully',
            complaint: newComplaint
        });
    } catch (error) {
        console.error('Error saving complaint:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



// Get Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('user bin');
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get current user's complaints
app.get('/api/complaints/my', protect, async (req, res) => {
  try {
    // Use the authenticated user from the middleware
    const userId = req.user.id;
    const complaints = await Complaint.find({ user: userId }).populate('bin');
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.get('/api/complaints/user/:userId', protect, async (req, res) => {
    try {
      const { userId } = req.params;
      // Ensure user can only access their own complaints
      if (!req.user || req.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const complaints = await Complaint.find({ user: userId }).populate('bin');
      if (!complaints.length) {
        return res.status(404).json({ message: 'No complaints found for this user' });
      }
      res.status(200).json(complaints);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Update Complaint Status
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, resolvedAt: status === 'completed' ? new Date() : null }, { new: true });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get all schedules (admin only)
app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update schedule status
app.put('/api/schedules/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.status(200).json({
      message: 'Schedule status updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Create Custom Schedule
app.post('/api/schedules', async (req, res) => {
    try {
      const { user, location, date, time, reason, wasteType, address } = req.body;
      
      if (!date || !time || !reason || !wasteType || !location) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      const newSchedule = new Schedule({
        user,
        location: address || location, // Use address if provided, otherwise use location
        date,
        time,
        reason,
        wasteType
      });
      
      await newSchedule.save();
      res.status(201).json({
        message: 'Schedule request created successfully',
        schedule: newSchedule
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Create Bin
app.post('/api/bins', async (req, res) => {
    try {
      const { binName, type, cleaningPeriod, assignedDriver } = req.body;
      const newBin = new Bin({ binName, type, cleaningPeriod, assignedDriver });
      await newBin.save();
      res.status(201).json({ message: 'Bin created successfully', bin: newBin });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });
  
  // Get Bins
  app.get('/api/driver/bins', async (req, res) => {
    try {
      const { driverName } = req.query;
  
      if (!driverName) {
        return res.status(400).json({ message: 'Missing driver name' });
      }
  
      // Find all bins, populate the driver, then filter by name
      const bins = await Bin.find()
        .populate('assignedDriver') // Make sure 'assignedDriver' is a reference
        .exec();
  
      const filteredBins = bins.filter(bin => bin.assignedDriver?.name === driverName);
  
      res.status(200).json(filteredBins);
    } catch (error) {
      console.error('Error fetching bins:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });
  
  // Assign Driver to Bin
  app.put('/api/bins/:id', async (req, res) => {
    try {
      const { assignedDriver } = req.body;
      const bin = await Bin.findByIdAndUpdate(req.params.id, { assignedDriver }, { new: true });
      if (!bin) {
        return res.status(404).json({ message: 'Bin not found' });
      }
      res.status(200).json({ message: 'Driver assigned successfully', bin });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });
  
  // Update Bin Status
  app.put('/api/bins/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const bin = await Bin.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!bin) {
        return res.status(404).json({ message: 'Bin not found' });
      }
      res.status(200).json({ message: 'Bin status updated successfully', bin });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

  app.get('/api/auth/users', async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

  app.get('/api/bins', async (req, res) => {
  const bins = await Bin.find(); // or apply any filtering logic
  res.json(bins);
});

// Update driver status (active/inactive) by driver
app.put('/api/driver/status', async (req, res) => {
  try {
    // Accept id or email for identifying the driver
    const { id, email, status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    let user;
    if (id) {
      user = await User.findByIdAndUpdate(id, { status }, { new: true });
    } else if (email) {
      user = await User.findOneAndUpdate({ email }, { status }, { new: true });
    } else {
      return res.status(400).json({ message: 'Driver id or email required' });
    }
    if (!user) return res.status(404).json({ message: 'Driver not found' });
    res.json({ status: user.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information (admin only)
app.put('/api/auth/users/:id', async (req, res) => {
  try {
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

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
