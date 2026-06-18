const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, supabaseSyncUser, getAllUsersExceptSelf } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validations/authValidation');
const validate = require('../middleware/validate');

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.post('/supabase-sync', supabaseSyncUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, getAllUsersExceptSelf);

module.exports = router;
