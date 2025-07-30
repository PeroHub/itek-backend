const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new admin user (consider disabling after initial setup)
// @access  Public
router.post('/register', authController.registerAdmin);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.loginAdmin);

// @route   GET /api/auth/me
// @desc    Get logged in admin user
// @access  Private
router.get('/me', authMiddleware, authController.getAdmin);

module.exports = router;