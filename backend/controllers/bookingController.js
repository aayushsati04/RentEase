const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Tenant only)
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, bookingDate } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.status === 'booked') {
      return res.status(400).json({ success: false, message: 'Property is already booked' });
    }

    const booking = await Booking.create({
      propertyId,
      tenantId: req.user.id,
      bookingDate
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.role === 'tenant') {
      // Tenants see their own booking requests
      bookings = await Booking.find({ tenantId: req.user.id })
        .populate('propertyId')
        .populate('tenantId', 'name email');
    } else if (req.user.role === 'landlord') {
      // Landlords see requests for their properties
      const properties = await Property.find({ ownerId: req.user.id });
      const propertyIds = properties.map(p => p._id);

      bookings = await Booking.find({ propertyId: { $in: propertyIds } })
        .populate('propertyId')
        .populate('tenantId', 'name email phone');
    } else {
      // Admins see everything
      bookings = await Booking.find()
        .populate('propertyId')
        .populate('tenantId', 'name email');
    }

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId')
      .populate('tenantId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check: Admin, Tenant booking owner, or Property owner landlord
    const isTenantOwner = booking.tenantId._id.toString() === req.user.id;
    const property = await Property.findById(booking.propertyId._id);
    const isPropertyOwner = property && property.ownerId.toString() === req.user.id;

    if (!isTenantOwner && !isPropertyOwner && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve / Reject)
// @route   PUT /api/bookings/:id
// @access  Private (Landlord or Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user owns the property being booked
    const property = await Property.findById(booking.propertyId);
    if (!property || (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(401).json({ success: false, message: 'Not authorized to edit booking status' });
    }

    booking.status = status;
    await booking.save();

    // If approved, mark property status as booked
    if (status === 'approved') {
      property.status = 'booked';
      await property.save();
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/delete booking request
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authority: Tenant owner or Landlord property owner
    const property = await Property.findById(booking.propertyId);
    const isTenantOwner = booking.tenantId.toString() === req.user.id;
    const isPropertyOwner = property && property.ownerId.toString() === req.user.id;

    if (!isTenantOwner && !isPropertyOwner && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // If booking was approved, make property available again upon deletion
    if (booking.status === 'approved' && property) {
      property.status = 'available';
      await property.save();
    }

    await booking.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
