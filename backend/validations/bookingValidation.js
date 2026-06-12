const { body, param } = require('express-validator');

const createBookingValidator = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid Property ID format'),
  body('bookingDate')
    .custom((value, { req }) => {
      if (!req.body.checkIn && !req.body.checkOut && !value) {
        throw new Error('Either bookingDate or checkIn/checkOut date ranges are required');
      }
      return true;
    })
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Booking date must be a valid ISO8601 date format')
    .toDate(),
  body('checkIn')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Check-in must be a valid ISO8601 date format')
    .toDate(),
  body('checkOut')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Check-out must be a valid ISO8601 date format')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.checkIn && new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    })
];

const updateBookingStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Booking ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'confirmed', 'completed', 'cancelled', 'rejected'])
    .withMessage('Status must be approved, confirmed, completed, cancelled, or rejected')
];

const bookingIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Booking ID format')
];

module.exports = {
  createBookingValidator,
  updateBookingStatusValidator,
  bookingIdParamValidator
};
