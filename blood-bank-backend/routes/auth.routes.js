const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', isAuthenticated, getMe);

module.exports = router;
