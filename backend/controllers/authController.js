const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const result = await authService.registerUser(req.body);
  
  // Return consistent MERN format + legacy root keys for frontend compatibility
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
    _id: result._id,
    name: result.name,
    email: result.email,
    role: result.role,
    token: result.token
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  // Return consistent MERN format + legacy root keys for frontend compatibility
  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: result,
    _id: result._id,
    name: result.name,
    email: result.email,
    role: result.role,
    token: result.token
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const result = await authService.getUserProfile(req.user.id);

  // Return consistent MERN format + legacy root keys for frontend compatibility
  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: result,
    _id: result._id,
    name: result.name,
    email: result.email,
    phone: result.phone,
    role: result.role
  });
});

// @desc    Sync Supabase user with MongoDB
// @route   POST /api/auth/supabase-sync
// @access  Public
exports.supabaseSyncUser = asyncHandler(async (req, res, next) => {
  const result = await authService.syncSupabaseUser(req.body);

  res.status(200).json({
    success: true,
    message: 'User synced successfully',
    data: result,
    _id: result._id,
    name: result.name,
    email: result.email,
    phone: result.phone,
    role: result.role,
    token: result.token
  });
});

// @desc    Get all users except currently logged in user
// @route   GET /api/auth/users
// @access  Private
exports.getAllUsersExceptSelf = asyncHandler(async (req, res, next) => {
  const result = await authService.getAllUsersExceptSelf(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result
  });
});
