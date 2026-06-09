const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  rent: {
    type: Number,
    required: [true, 'Please add a rent amount']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please specify the number of bedrooms']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please specify the number of bathrooms']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
