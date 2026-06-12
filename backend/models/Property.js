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
  type: {
    type: String,
    trim: true,
    default: 'Apartment'
  },
  area: {
    type: Number,
    default: 0
  },
  amenities: [{
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
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for query optimization
propertySchema.index({ location: 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ averageRating: -1 });

module.exports = mongoose.model('Property', propertySchema);
