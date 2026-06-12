const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const bookingService = require('./bookingService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret456'
});

class PaymentService {
  async createPaymentSession(bookingId, amount, paymentMethod, tenantId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Security: Only the tenant who made the booking can pay for it
    if (booking.tenantId.toString() !== tenantId) {
      throw new ApiError(403, 'Not authorized to pay for this booking');
    }

    // Validation: Prevent payments on cancelled, rejected, or completed bookings
    const restrictedBookingStatuses = ['cancelled', 'rejected', 'completed'];
    if (restrictedBookingStatuses.includes(booking.status)) {
      throw new ApiError(400, `Cannot pay for a booking with status '${booking.status}'`);
    }

    // Validation: Prevent multiple completed payments for the same booking
    const existingCompletedPayment = await Payment.findOne({
      bookingId,
      paymentStatus: 'completed'
    });
    if (existingCompletedPayment) {
      throw new ApiError(400, 'This booking has already been paid for');
    }

    // Create Razorpay Order
    let razorpayOrder;
    const isDummyKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummykeyid123';

    if (isDummyKey) {
      razorpayOrder = {
        id: `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: bookingId.toString()
      };
    } else {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: bookingId.toString()
      };

      try {
        razorpayOrder = await razorpay.orders.create(options);
      } catch (err) {
        throw new ApiError(500, `Razorpay Order creation failed: ${err.message || JSON.stringify(err)}`);
      }
    }

    const payment = await Payment.create({
      bookingId,
      tenantId,
      amount,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'pending',
      transactionId: razorpayOrder.id
    });

    const paymentObj = payment.toObject();
    paymentObj.razorpayOrderId = razorpayOrder.id;
    paymentObj.razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123';

    return paymentObj;
  }

  async verifyPayment(paymentId, statusInput, successInput, transactionIdInput, tenantId, razorpayData = {}) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found');
    }

    // Security: Ensure the tenant verifying is the owner of the payment
    if (payment.tenantId.toString() !== tenantId) {
      throw new ApiError(403, 'Not authorized to verify this payment');
    }

    // Validation: Only allow transitioning from 'pending'
    if (payment.paymentStatus !== 'pending') {
      throw new ApiError(400, `Payment has already been processed with status '${payment.paymentStatus}'`);
    }

    let targetStatus = 'failed';
    let finalTransactionId = transactionIdInput || payment.transactionId;

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorpayData;

    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123';
      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret456';

      if (keyId === 'rzp_test_dummykeyid123') {
        targetStatus = 'completed';
        finalTransactionId = razorpay_payment_id;
      } else {
        const generated_signature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generated_signature === razorpay_signature) {
          targetStatus = 'completed';
          finalTransactionId = razorpay_payment_id;
        } else {
          payment.paymentStatus = 'failed';
          await payment.save();
          throw new ApiError(400, 'Invalid Razorpay signature. Payment verification failed.');
        }
      }
    } else {
      if (statusInput) {
        targetStatus = statusInput;
      } else if (successInput === true) {
        targetStatus = 'completed';
      }
    }

    // Update transaction fields
    payment.paymentStatus = targetStatus;
    payment.transactionId = finalTransactionId;
    await payment.save();

    // Booking-Payment Linking & Status Progression Workflow
    if (targetStatus === 'completed') {
      const booking = await Booking.findById(payment.bookingId);
      if (!booking) {
        throw new ApiError(404, 'Associated booking not found');
      }

      // Check conflicts immediately before promoting booking status (Prevent double bookings)
      const start = booking.checkIn || booking.bookingDate;
      const end = booking.checkOut || booking.bookingDate;
      await bookingService.detectConflicts(booking.propertyId, start, end, booking._id);

      // Promote Booking to confirmed
      booking.status = 'confirmed';
      await booking.save();

      // Update Property availability status to booked
      const property = await Property.findById(booking.propertyId);
      if (property) {
        property.status = 'booked';
        await property.save();
      }
    }

    return payment;
  }

  async refundPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found');
    }

    // State machine check: Must be completed to be refunded
    if (payment.paymentStatus !== 'completed') {
      throw new ApiError(400, `Cannot refund payment with status '${payment.paymentStatus}'`);
    }

    payment.paymentStatus = 'refunded';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      // Transition booking status to cancelled
      booking.status = 'cancelled';
      await booking.save();

      // Revert Property status if no other active bookings overlap
      const property = await Property.findById(booking.propertyId);
      if (property) {
        const activeBookingsExist = await Booking.exists({
          propertyId: booking.propertyId,
          _id: { $ne: booking._id },
          status: { $in: ['approved', 'confirmed'] }
        });
        if (!activeBookingsExist) {
          property.status = 'available';
          await property.save();
        }
      }
    }

    return payment;
  }

  async getPaymentHistory(queryParams, user) {
    let query = {};

    // Scope payment lookup based on role permissions (Secure Architecture)
    if (user.role === 'tenant') {
      query.tenantId = user.id;
    } else if (user.role === 'landlord') {
      // Find properties owned by landlord
      const properties = await Property.find({ ownerId: user.id }).select('_id');
      const propertyIds = properties.map(p => p._id);

      // Find bookings associated with those properties
      const bookings = await Booking.find({ propertyId: { $in: propertyIds } }).select('_id');
      const bookingIds = bookings.map(b => b._id);

      // Filter payments linked to these bookings
      query.bookingId = { $in: bookingIds };
    } else if (user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to view payment logs');
    }

    // Apply query filters
    if (queryParams.paymentStatus) {
      query.paymentStatus = queryParams.paymentStatus;
    }

    // Filter by min/max amount
    if (queryParams.minAmount) {
      query.amount = { ...query.amount, $gte: Number(queryParams.minAmount) };
    }
    if (queryParams.maxAmount) {
      query.amount = { ...query.amount, $lte: Number(queryParams.maxAmount) };
    }

    // Pagination
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (queryParams.sort) {
      const sortMap = {
        'newest': { createdAt: -1 },
        'oldest': { createdAt: 1 },
        'amount-asc': { amount: 1 },
        'amount-desc': { amount: -1 }
      };
      if (sortMap[queryParams.sort]) {
        sortOption = sortMap[queryParams.sort];
      }
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: 'bookingId',
          populate: { path: 'propertyId', select: 'title rent' }
        })
        .populate('tenantId', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }
}

module.exports = new PaymentService();
