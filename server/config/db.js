const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('\nMake sure MongoDB is running with: mongod --dbpath C:\\Users\\nehad\\mongodb-data');
    process.exit(1);
  }
};

module.exports = connectDB;