const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Use the environment variable for MongoDB URI, fallback to local DB
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-innovators-club', 
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;