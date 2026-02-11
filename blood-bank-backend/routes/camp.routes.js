const express = require('express');
const router = express.Router();
const {
  createCamp,
  getAllCamps,
  getUpcomingCamps,
  registerForCamp,
  markAttendance,
  updateCampStatus
} = require('../controllers/campController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.get('/', getAllCamps);
router.get('/upcoming', getUpcomingCamps);
router.post('/:id/register', registerForCamp);

// Admin routes
router.post('/', isAuthenticated, createCamp);
router.put('/:id/attendance/:registrationId', isAuthenticated, markAttendance);
router.put('/:id/status', isAuthenticated, updateCampStatus);

module.exports = router;
