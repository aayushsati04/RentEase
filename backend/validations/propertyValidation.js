const { body, param, query } = require('express-validator');

const createPropertyValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('rent')
    .notEmpty()
    .withMessage('Rent price is required')
    .isFloat({ min: 1 })
    .withMessage('Rent must be a positive number'),
  body('bedrooms')
    .notEmpty()
    .withMessage('Number of bedrooms is required')
    .isInt({ min: 0 })
    .withMessage('Bedrooms count must be a non-negative integer'),
  body('bathrooms')
    .notEmpty()
    .withMessage('Number of bathrooms is required')
    .isInt({ min: 1 })
    .withMessage('Bathrooms count must be at least 1'),
  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be provided as an array'),
  body('virtualTourUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Virtual tour must be a valid URL')
];

const updatePropertyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Property ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('rent')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Rent must be a positive number'),
  body('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms count must be a non-negative integer'),
  body('bathrooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Bathrooms count must be at least 1'),
  body('area')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('virtualTourUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Virtual tour must be a valid URL')
];

const propertyIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Property ID format')
];

const getPropertiesQueryValidator = [
  query('minRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum rent must be a non-negative number'),
  query('maxRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum rent must be a non-negative number'),
  query('bedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bedrooms count must be a non-negative integer'),
  query('bathrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bathrooms count must be a non-negative integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer'),
  query('search')
    .optional()
    .trim()
    .isString()
    .withMessage('Search keyword must be a string'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'price-asc', 'price-desc', 'rating-desc'])
    .withMessage('Sort option must be newest, oldest, price-asc, price-desc, or rating-desc'),
  query('type')
    .optional()
    .trim(),
  query('status')
    .optional()
    .isIn(['available', 'booked'])
    .withMessage('Status must be available or booked')
];

module.exports = {
  createPropertyValidator,
  updatePropertyValidator,
  propertyIdParamValidator,
  getPropertiesQueryValidator
};
