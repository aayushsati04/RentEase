const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Chat = require('./models/Chat');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentease';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('Connected!');

    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const chatCount = await Chat.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const reviewCount = await Review.countDocuments();

    console.log('--- Database Audit Counts ---');
    console.log('Users:', userCount);
    console.log('Properties:', propertyCount);
    console.log('Bookings:', bookingCount);
    console.log('Chats:', chatCount);
    console.log('Payments:', paymentCount);
    console.log('Reviews:', reviewCount);

    if (userCount > 0) {
      console.log('\n--- Sample Users ---');
      const users = await User.find().limit(5);
      users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`));
    }

    if (propertyCount > 0) {
      console.log('\n--- Sample Properties ---');
      const properties = await Property.find().limit(3);
      properties.forEach(p => console.log(`- ${p.title} (${p.location}) [Price: ₹${p.rent}]`));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
