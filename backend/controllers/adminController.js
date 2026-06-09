const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Terminate user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a property listing
// @route   PUT /api/admin/properties/:id/verify
// @access  Private (Admin only)
exports.verifyProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.isVerified = true;
    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve system admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const verifiedProperties = await Property.countDocuments({ isVerified: true });
    const totalBookings = await Booking.countDocuments();

    // Sum total successful payments
    const payments = await Payment.find({ paymentStatus: 'completed' });
    const totalRevenue = payments.reduce((acc, current) => acc + current.amount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        verifiedProperties,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};
