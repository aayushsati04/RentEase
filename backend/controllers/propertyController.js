const propertyService = require('../services/propertyService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all properties (with filtering & search)
// @route   GET /api/properties
// @access  Public
exports.getProperties = asyncHandler(async (req, res, next) => {
  const { properties, pagination } = await propertyService.getProperties(req.query);

  res.status(200).json({
    success: true,
    message: 'Properties retrieved successfully',
    count: properties.length,
    pagination,
    data: properties
  });
});

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await propertyService.getProperty(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Property details retrieved successfully',
    data: property
  });
});

// @desc    Add a property listing
// @route   POST /api/properties
// @access  Private (Landlord only)
exports.createProperty = asyncHandler(async (req, res, next) => {
  // Attach ownerId from auth middleware
  req.body.ownerId = req.user.id;

  // By default, listings must be verified by admin
  req.body.isVerified = false;

  const property = await propertyService.createProperty(req.body);

  res.status(201).json({
    success: true,
    message: 'Property listing created successfully',
    data: property
  });
});

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
exports.updateProperty = asyncHandler(async (req, res, next) => {
  const property = await propertyService.updateProperty(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: 'Property listing updated successfully',
    data: property
  });
});

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
exports.deleteProperty = asyncHandler(async (req, res, next) => {
  await propertyService.deleteProperty(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Property listing deleted successfully',
    data: {}
  });
});
