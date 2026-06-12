const { query } = require('express-validator');

const getUsersQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer'),
  query('role')
    .optional()
    .isIn(['tenant', 'landlord', 'admin'])
    .withMessage('Role must be tenant, landlord, or admin')
];

const getBookingsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected'])
    .withMessage('Status must be pending, approved, confirmed, completed, cancelled, or rejected'),
  query('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Property ID format'),
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Tenant ID format')
];

const getPropertiesQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer'),
  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified parameter must be a boolean')
];

module.exports = {
  getUsersQueryValidator,
  getBookingsQueryValidator,
  getPropertiesQueryValidator
};
