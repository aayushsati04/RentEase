const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please add a booking date']
  },
  checkIn: {
    type: Date,
    required: false
  },
  checkOut: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure checkIn/checkOut fallback to bookingDate for legacy payloads
bookingSchema.pre('save', function (next) {
  if (!this.checkIn && this.bookingDate) {
    this.checkIn = this.bookingDate;
  }
  if (!this.checkOut && this.bookingDate) {
    this.checkOut = this.bookingDate;
  }
  next();
});

// Indexes for query optimization
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ tenantId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
