const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const {
  createBookingValidator,
  updateBookingStatusValidator,
  bookingIdParamValidator
} = require('../validations/bookingValidation');
const validate = require('../middleware/validate');

router.use(protect); // All booking routes require authentication

router.post('/', createBookingValidator, validate, createBooking);
router.get('/', getBookings);
router.get('/:id', bookingIdParamValidator, validate, getBooking);
router.put('/:id', updateBookingStatusValidator, validate, updateBookingStatus);
router.delete('/:id', bookingIdParamValidator, validate, deleteBooking);

module.exports = router;
