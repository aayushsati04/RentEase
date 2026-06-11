const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('RentEase=')
      ? process.env.MONGODB_URI
      : 'mongodb+srv://aayush:bhanu0704@aayushsati.e62qqm9.mongodb.net/rentease?retryWrites=true&w=majority';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
