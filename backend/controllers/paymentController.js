const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Initiate/Create checkout session
// @route   POST /api/payments/create
// @access  Private (Tenant only)
exports.createPayment = asyncHandler(async (req, res, next) => {
  const { bookingId, amount, paymentMethod } = req.body;

  const payment = await paymentService.createPaymentSession(
    bookingId,
    amount,
    paymentMethod,
    req.user.id
  );

  res.status(201).json(
    new ApiResponse(201, payment, 'Payment session initiated successfully')
  );
});

// @desc    Verify payment transaction
// @route   POST /api/payments/verify
// @access  Private (Tenant only)
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { paymentId, status, success, transactionId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const payment = await paymentService.verifyPayment(
    paymentId,
    status,
    success,
    transactionId,
    req.user.id,
    { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  );

  res.status(200).json(
    new ApiResponse(200, payment, 'Payment transaction verified successfully')
  );
});

// @desc    Refund a completed payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin only)
exports.refundPayment = asyncHandler(async (req, res, next) => {
  const payment = await paymentService.refundPayment(req.params.id);

  res.status(200).json(
    new ApiResponse(200, payment, 'Payment refunded successfully')
  );
});

// @desc    Get payment logs/history (paginated, filtered & sorted)
// @route   GET /api/payments
// @access  Private (Tenant, Landlord, Admin)
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const { payments, pagination } = await paymentService.getPaymentHistory(
    req.query,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Payment logs retrieved successfully',
    count: payments.length,
    pagination,
    data: payments
  });
});
