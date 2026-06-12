const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPropertyValidator,
  updatePropertyValidator,
  propertyIdParamValidator,
  getPropertiesQueryValidator
} = require('../validations/propertyValidation');
const validate = require('../middleware/validate');

router.get('/', getPropertiesQueryValidator, validate, getProperties);
router.get('/:id', propertyIdParamValidator, validate, getProperty);

// Protected routes (Landlord or Admin)
router.post('/', protect, authorize('landlord', 'admin'), createPropertyValidator, validate, createProperty);
router.put('/:id', protect, authorize('landlord', 'admin'), updatePropertyValidator, validate, updateProperty);
router.delete('/:id', protect, authorize('landlord', 'admin'), propertyIdParamValidator, validate, deleteProperty);

module.exports = router;
