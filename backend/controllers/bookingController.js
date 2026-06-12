const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Tenant only)
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { propertyId, bookingDate, checkIn, checkOut } = req.body;
  const booking = await bookingService.createBooking(propertyId, bookingDate, checkIn, checkOut, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Booking request created successfully',
    data: booking
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  const bookings = await bookingService.getBookings(req.user);

  res.status(200).json({
    success: true,
    message: 'Bookings retrieved successfully',
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await bookingService.getBooking(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Booking details retrieved successfully',
    data: booking
  });
});

// @desc    Update booking status (Approve / Reject)
// @route   PUT /api/bookings/:id
// @access  Private (Landlord or Admin)
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(req.params.id, status, req.user);

  res.status(200).json({
    success: true,
    message: `Booking status updated to ${status} successfully`,
    data: booking
  });
});

// @desc    Cancel/delete booking request
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  await bookingService.deleteBooking(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Booking request cancelled and deleted successfully',
    data: {}
  });
});
