const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  verifyProperty,
  getAllProperties,
  getAllBookings,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUsersQueryValidator,
  getBookingsQueryValidator,
  getPropertiesQueryValidator
} = require('../validations/adminValidation');
const validate = require('../middleware/validate');

router.use(protect);
router.use(authorize('admin')); // Secure Admin authorization

router.get('/users', getUsersQueryValidator, validate, getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/properties', getPropertiesQueryValidator, validate, getAllProperties);
router.put('/properties/:id/verify', verifyProperty);

router.get('/bookings', getBookingsQueryValidator, validate, getAllBookings);
router.get('/dashboard', getDashboardStats);

module.exports = router;
