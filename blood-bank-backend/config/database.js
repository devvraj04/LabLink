const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running but database features will not work.');
    console.error('⚠️  Please check your MONGODB_URI environment variable.');
    // Don't exit - let server start anyway
  }
};

module.exports = connectDB;
