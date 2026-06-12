const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPaymentValidator,
  verifyPaymentValidator,
  getPaymentsQueryValidator,
  refundPaymentValidator
} = require('../validations/paymentValidation');
const validate = require('../middleware/validate');

router.use(protect); // Authentication required

router.post(
  '/create',
  authorize('tenant'),
  createPaymentValidator,
  validate,
  createPayment
);

router.post(
  '/verify',
  authorize('tenant'),
  verifyPaymentValidator,
  validate,
  verifyPayment
);

router.post(
  '/:id/refund',
  authorize('admin'),
  refundPaymentValidator,
  validate,
  refundPayment
);

router.get(
  '/',
  getPaymentsQueryValidator,
  validate,
  getPaymentHistory
);

module.exports = router;
