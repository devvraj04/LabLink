const express = require('express');
const router = express.Router();
const {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateHospitalProfile,
  changePassword
} = require('../controllers/hospitalAuthController');
const isHospitalAuthenticated = require('../middleware/isHospitalAuthenticated');

// Public routes
router.post('/register', registerHospital);
router.post('/login', loginHospital);

// Protected routes (require hospital authentication)
router.get('/me', isHospitalAuthenticated, getHospitalProfile);
router.put('/profile', isHospitalAuthenticated, updateHospitalProfile);
router.put('/change-password', isHospitalAuthenticated, changePassword);

module.exports = router;
