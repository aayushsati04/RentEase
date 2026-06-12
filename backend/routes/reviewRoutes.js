const express = require('express');
const router = express.Router();
const {
  addReview,
  getPropertyReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const {
  addReviewValidator,
  getPropertyReviewsValidator,
  deleteReviewValidator
} = require('../validations/reviewValidation');
const validate = require('../middleware/validate');

router.get(
  '/:propertyId',
  getPropertyReviewsValidator,
  validate,
  getPropertyReviews
);

router.post(
  '/',
  protect,
  addReviewValidator,
  validate,
  addReview
);

router.delete(
  '/:id',
  protect,
  deleteReviewValidator,
  validate,
  deleteReview
);

module.exports = router;
