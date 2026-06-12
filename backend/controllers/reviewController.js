const reviewService = require('../services/reviewService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Add review for a property listing
// @route   POST /api/reviews
// @access  Private (Tenant only)
exports.addReview = asyncHandler(async (req, res, next) => {
  const { propertyId, rating, comment } = req.body;
  const review = await reviewService.addReview(
    propertyId,
    rating,
    comment,
    req.user.id
  );

  res.status(201).json(
    new ApiResponse(201, 'Review created successfully', review)
  );
});

// @desc    Get reviews for specific property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getPropertyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await reviewService.getPropertyReviews(req.params.propertyId);

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    count: reviews.length,
    data: reviews
  });
});

// @desc    Delete a property review
// @route   DELETE /api/reviews/:id
// @access  Private (Author or Admin only)
exports.deleteReview = asyncHandler(async (req, res, next) => {
  await reviewService.deleteReview(
    req.params.id,
    req.user.id,
    req.user.role
  );

  res.status(200).json(
    new ApiResponse(200, 'Review deleted successfully', {})
  );
});
