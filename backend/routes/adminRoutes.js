const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, verifyProperty, getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // All endpoints in this router are restricted to administrator role

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/properties/:id/verify', verifyProperty);
router.get('/dashboard', getDashboardStats);

module.exports = router;
