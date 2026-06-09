const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Add review for a property listing
// @route   POST /api/reviews
// @access  Private (Tenant only)
exports.addReview = async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const review = await Review.create({
      propertyId,
      userId: req.user.id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for specific property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId })
      .populate('userId', 'name');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property review
// @route   DELETE /api/reviews/:id
// @access  Private (Author or Admin only)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Auth check: Owner of review or administrator
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
