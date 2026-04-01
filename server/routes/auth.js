const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Login route - NO middleware
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body.username);
  
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password incorrect for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    console.log('Login successful for:', username);
    
    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      token: generateToken(admin._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const admin = await Admin.create({ username, email, password, fullName });
    
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      token: generateToken(admin._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current admin - with manual token check
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json(admin);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;