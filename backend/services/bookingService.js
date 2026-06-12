const Booking = require('../models/Booking');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');

class BookingService {
  // Helper to check for booking conflicts / overlapping lease durations
  async detectConflicts(propertyId, checkIn, checkOut, excludeBookingId = null) {
    const query = {
      propertyId,
      status: { $in: ['approved', 'confirmed'] },
      checkIn: { $lte: checkOut },
      checkOut: { $gte: checkIn }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(query);
    if (conflictingBooking) {
      const startStr = conflictingBooking.checkIn.toISOString().split('T')[0];
      const endStr = conflictingBooking.checkOut.toISOString().split('T')[0];
      throw new ApiError(
        400,
        `Booking conflict: Property is already booked between ${startStr} and ${endStr}`
      );
    }
  }

  async createBooking(propertyId, bookingDate, checkIn, checkOut, tenantId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    // Resolve date boundaries
    const resolvedCheckIn = checkIn ? new Date(checkIn) : new Date(bookingDate);
    const resolvedCheckOut = checkOut ? new Date(checkOut) : new Date(bookingDate);

    // Verify there are no overlapping confirmed/approved bookings (Prevent double bookings)
    await this.detectConflicts(propertyId, resolvedCheckIn, resolvedCheckOut);

    return await Booking.create({
      propertyId,
      tenantId,
      bookingDate: bookingDate || resolvedCheckIn,
      checkIn: resolvedCheckIn,
      checkOut: resolvedCheckOut,
      status: 'pending'
    });
  }

  async getBookings(user) {
    let bookings;

    if (user.role === 'tenant') {
      bookings = await Booking.find({ tenantId: user.id })
        .populate('propertyId')
        .populate('tenantId', 'name email');
    } else if (user.role === 'landlord') {
      const properties = await Property.find({ ownerId: user.id });
      const propertyIds = properties.map(p => p._id);

      bookings = await Booking.find({ propertyId: { $in: propertyIds } })
        .populate('propertyId')
        .populate('tenantId', 'name email phone');
    } else {
      bookings = await Booking.find()
        .populate('propertyId')
        .populate('tenantId', 'name email');
    }

    return bookings;
  }

  async getBooking(id, user) {
    const booking = await Booking.findById(id)
      .populate('propertyId')
      .populate('tenantId', 'name email phone');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    const isTenantOwner = booking.tenantId._id.toString() === user.id;
    const property = await Property.findById(booking.propertyId._id);
    const isPropertyOwner = property && property.ownerId.toString() === user.id;

    if (!isTenantOwner && !isPropertyOwner && user.role !== 'admin') {
      throw new ApiError(401, 'Not authorized to view this booking');
    }

    return booking;
  }

  async updateBookingStatus(id, status, user) {
    let booking = await Booking.findById(id);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    const property = await Property.findById(booking.propertyId);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    // Verify user owns the property being booked or is admin
    if (property.ownerId.toString() !== user.id && user.role !== 'admin') {
      throw new ApiError(401, 'Not authorized to edit booking status');
    }

    const currentStatus = booking.status;

    // Allowed workflow status state machine transitions
    const allowedTransitions = {
      pending: ['approved', 'confirmed', 'rejected', 'cancelled'],
      approved: ['completed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(status)) {
      throw new ApiError(
        400,
        `Invalid status transition: Cannot change booking status from '${currentStatus}' to '${status}'`
      );
    }

    // Validate date overlaps when transitioning to confirmed/approved
    if (['approved', 'confirmed'].includes(status)) {
      const start = booking.checkIn || booking.bookingDate;
      const end = booking.checkOut || booking.bookingDate;
      await this.detectConflicts(booking.propertyId, start, end, booking._id);
    }

    booking.status = status;
    await booking.save();

    // Synchronize Property status
    if (['approved', 'confirmed'].includes(status)) {
      property.status = 'booked';
      await property.save();
    } else if (['completed', 'cancelled', 'rejected'].includes(status)) {
      // Check if there are other active approved/confirmed bookings on this property
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

    return booking;
  }

  async deleteBooking(id, user) {
    const booking = await Booking.findById(id);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    const property = await Property.findById(booking.propertyId);
    const isTenantOwner = booking.tenantId.toString() === user.id;
    const isPropertyOwner = property && property.ownerId.toString() === user.id;

    if (!isTenantOwner && !isPropertyOwner && user.role !== 'admin') {
      throw new ApiError(401, 'Not authorized to cancel this booking');
    }

    // If active approved booking is deleted, revert property status to available
    if (['approved', 'confirmed'].includes(booking.status) && property) {
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

    await booking.deleteOne();
    return true;
  }
}

module.exports = new BookingService();
