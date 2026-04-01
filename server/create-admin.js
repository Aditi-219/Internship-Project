const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/quickpaypro');
    console.log('Connected to MongoDB');

    // Get the admins collection directly
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');

    // Check if admin exists
    const existingAdmin = await adminsCollection.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin
    await adminsCollection.insertOne({
      username: 'admin',
      email: 'admin@quickpay.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      lastLogin: null,
      createdAt: new Date()
    });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createAdmin();