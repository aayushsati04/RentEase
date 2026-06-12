const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentease';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected!');

    const users = await User.find();
    for (const user of users) {
      user.password = 'password123';
      await user.save();
      console.log(`Updated password for ${user.email}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
