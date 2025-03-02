const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB connected successfully!');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1); // Stop the app if DB is not connected
  }
};

module.exports = connectDB;
