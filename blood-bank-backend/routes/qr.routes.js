const express = require('express');
const router = express.Router();
const {
  generateDonorQR,
  generateSpecimenQR,
  scanQR
} = require('../controllers/qrController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.get('/donor/:id', generateDonorQR);

// Private routes
router.get('/specimen/:id', isAuthenticated, generateSpecimenQR);
router.post('/scan', isAuthenticated, scanQR);

module.exports = router;
