const { body, param } = require('express-validator');

const addReviewValidator = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid Property ID format'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters')
];

const getPropertyReviewsValidator = [
  param('propertyId')
    .isMongoId()
    .withMessage('Invalid Property ID format')
];

const deleteReviewValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Review ID format')
];

module.exports = {
  addReviewValidator,
  getPropertyReviewsValidator,
  deleteReviewValidator
};
