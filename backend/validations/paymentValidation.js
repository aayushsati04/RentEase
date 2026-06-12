const { body, param, query } = require('express-validator');

const createPaymentValidator = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid Booking ID format'),
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'paypal', 'upi', 'net_banking'])
    .withMessage('Invalid payment method')
];

const verifyPaymentValidator = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Invalid Payment ID format'),
  body('success')
    .optional()
    .isBoolean()
    .withMessage('Success parameter must be a boolean'),
  body('status')
    .optional()
    .isIn(['completed', 'failed'])
    .withMessage('Status must be completed or failed'),
  body('transactionId')
    .optional()
    .trim()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('razorpay_payment_id')
    .optional()
    .trim()
    .isString()
    .withMessage('Razorpay payment ID must be a string'),
  body('razorpay_order_id')
    .optional()
    .trim()
    .isString()
    .withMessage('Razorpay order ID must be a string'),
  body('razorpay_signature')
    .optional()
    .trim()
    .isString()
    .withMessage('Razorpay signature must be a string')
];

const getPaymentsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Payment status must be pending, completed, failed, or refunded'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a non-negative number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a non-negative number'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'amount-asc', 'amount-desc'])
    .withMessage('Sort option must be newest, oldest, amount-asc, or amount-desc')
];

const refundPaymentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Payment ID format')
];

module.exports = {
  createPaymentValidator,
  verifyPaymentValidator,
  getPaymentsQueryValidator,
  refundPaymentValidator
};
