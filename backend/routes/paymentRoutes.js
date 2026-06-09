const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // Authentication required

router.post('/create', authorize('tenant'), createPayment);
router.post('/verify', authorize('tenant'), verifyPayment);
router.get('/', getPaymentHistory);

module.exports = router;
