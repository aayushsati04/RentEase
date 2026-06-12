const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');

class AdminService {
  async getAllUsers(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (queryParams.role) {
      query.role = queryParams.role;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }

  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Secure Cascade Deletion based on roles (Prevent Orphan Records)
    if (user.role === 'landlord') {
      // Find all properties owned by landlord
      const properties = await Property.find({ ownerId: userId }).select('_id');
      const propertyIds = properties.map(p => p._id);

      if (propertyIds.length > 0) {
        // Find bookings on landlord's properties
        const bookings = await Booking.find({ propertyId: { $in: propertyIds } }).select('_id');
        const bookingIds = bookings.map(b => b._id);

        // Delete associated payments
        if (bookingIds.length > 0) {
          await Payment.deleteMany({ bookingId: { $in: bookingIds } });
        }

        // Delete associated bookings
        await Booking.deleteMany({ propertyId: { $in: propertyIds } });

        // Delete associated reviews
        await Review.deleteMany({ propertyId: { $in: propertyIds } });

        // Delete properties
        await Property.deleteMany({ ownerId: userId });
      }
    } else if (user.role === 'tenant') {
      // Find all bookings made by tenant
      const bookings = await Booking.find({ tenantId: userId }).select('_id');
      const bookingIds = bookings.map(b => b._id);

      // Delete associated payments
      if (bookingIds.length > 0) {
        await Payment.deleteMany({ bookingId: { $in: bookingIds } });
      }
      
      // Delete payments where tenantId is set directly
      await Payment.deleteMany({ tenantId: userId });

      // Delete tenant bookings
      await Booking.deleteMany({ tenantId: userId });

      // Delete tenant reviews
      await Review.deleteMany({ userId });
    }

    // Finally, remove the User record
    await user.deleteOne();
    return true;
  }

  async verifyProperty(propertyId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    property.isVerified = true;
    await property.save();

    return property;
  }

  async getAllProperties(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (queryParams.isVerified !== undefined) {
      query.isVerified = queryParams.isVerified === 'true' || queryParams.isVerified === true;
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('ownerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(query)
    ]);

    return {
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }

  async getAllBookings(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (queryParams.status) {
      query.status = queryParams.status;
    }
    if (queryParams.propertyId) {
      query.propertyId = queryParams.propertyId;
    }
    if (queryParams.tenantId) {
      query.tenantId = queryParams.tenantId;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('propertyId', 'title rent location')
        .populate('tenantId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    return {
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      tenantUsers,
      landlordUsers,
      adminUsers,
      totalProperties,
      verifiedProperties,
      unverifiedProperties,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      payments,
      recentUsers,
      recentProperties,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tenant' }),
      User.countDocuments({ role: 'landlord' }),
      User.countDocuments({ role: 'admin' }),
      Property.countDocuments(),
      Property.countDocuments({ isVerified: true }),
      Property.countDocuments({ isVerified: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Payment.find({ paymentStatus: 'completed' }),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      Property.find().populate('ownerId', 'name').sort({ createdAt: -1 }).limit(5),
      Booking.find().populate('tenantId', 'name').populate('propertyId', 'title').sort({ createdAt: -1 }).limit(5)
    ]);

    const totalRevenue = payments.reduce((sum, pay) => sum + pay.amount, 0);

    return {
      totalUsers,
      usersBreakdown: {
        tenant: tenantUsers,
        landlord: landlordUsers,
        admin: adminUsers
      },
      totalProperties,
      propertiesBreakdown: {
        verified: verifiedProperties,
        unverified: unverifiedProperties
      },
      totalBookings,
      bookingsBreakdown: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      },
      totalRevenue,
      recentActivity: {
        users: recentUsers,
        properties: recentProperties,
        bookings: recentBookings
      }
    };
  }
}

module.exports = new AdminService();
