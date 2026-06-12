const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all users list (paginated, with filtering)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { users, pagination } = await adminService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Terminate user account (cascade deletions)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await adminService.deleteUser(req.params.id);

  res.status(200).json(
    new ApiResponse(200, 'User and all associated listings/records terminated successfully', {})
  );
});

// @desc    Verify a property listing
// @route   PUT /api/admin/properties/:id/verify
// @access  Private (Admin only)
exports.verifyProperty = asyncHandler(async (req, res, next) => {
  const property = await adminService.verifyProperty(req.params.id);

  res.status(200).json(
    new ApiResponse(200, 'Property listing verified successfully', property)
  );
});

// @desc    Get all properties (paginated, with filtering)
// @route   GET /api/admin/properties
// @access  Private (Admin only)
exports.getAllProperties = asyncHandler(async (req, res, next) => {
  const { properties, pagination } = await adminService.getAllProperties(req.query);

  res.status(200).json({
    success: true,
    message: 'Properties retrieved successfully',
    count: properties.length,
    pagination,
    data: properties
  });
});

// @desc    Get all bookings (paginated, with filtering)
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { bookings, pagination } = await adminService.getAllBookings(req.query);

  res.status(200).json({
    success: true,
    message: 'Bookings retrieved successfully',
    count: bookings.length,
    pagination,
    data: bookings
  });
});

// @desc    Retrieve system admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json(
    new ApiResponse(200, 'Dashboard statistics retrieved successfully', stats)
  );
});
