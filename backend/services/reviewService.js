const Review = require('../models/Review');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');

class ReviewService {
  async addReview(propertyId, rating, comment, userId) {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new ApiError(404, 'Property not found');
    }

    const review = await Review.create({
      propertyId,
      userId,
      rating,
      comment
    });

    return review;
  }

  async getPropertyReviews(propertyId) {
    const reviews = await Review.find({ propertyId })
      .populate('userId', 'name');
    return reviews;
  }

  async deleteReview(reviewId, userId, userRole) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Authorization check: Only author or admin can delete review
    if (review.userId.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(401, 'Not authorized to delete this review');
    }

    await review.deleteOne();
    return true;
  }
}

module.exports = new ReviewService();
