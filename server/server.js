const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Simple test route - no middleware
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/payroll', require('./routes/payroll'));

app.get('/', (req, res) => {
  res.json({ message: 'QuickPay Pro+ API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});