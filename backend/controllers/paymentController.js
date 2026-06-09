const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Initiate/Create checkout session
// @route   POST /api/payments/create
// @access  Private (Tenant only)
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure tenant matches booking requester
    if (booking.tenantId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment transaction
// @route   POST /api/payments/verify
// @access  Private (Tenant only)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, success } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (success) {
      payment.paymentStatus = 'completed';
      await payment.save();

      // Automatically update property status on booking approved + paid
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.status = 'approved';
        await booking.save();
      }
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment logs/history
// @route   GET /api/payments
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    let payments;

    if (req.user.role === 'tenant') {
      const userBookings = await Booking.find({ tenantId: req.user.id });
      const bookingIds = userBookings.map(b => b._id);

      payments = await Payment.find({ bookingId: { $in: bookingIds } })
        .populate({
          path: 'bookingId',
          populate: { path: 'propertyId', select: 'title rent' }
        });
    } else if (req.user.role === 'admin') {
      payments = await Payment.find()
        .populate({
          path: 'bookingId',
          populate: { path: 'propertyId', select: 'title rent' }
        });
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized to view payment logs' });
    }

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
