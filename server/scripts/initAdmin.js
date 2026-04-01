const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await Admin.create({
        username: 'admin',
        email: 'admin@quickpay.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

module.exports = initAdmin;