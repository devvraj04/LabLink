const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentsByDonor,
  getAvailableSlots,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.post('/', createAppointment);
router.get('/donor/:donorId', getAppointmentsByDonor);
router.get('/available-slots', getAvailableSlots);
router.delete('/:id', cancelAppointment);

// Admin routes
router.get('/', isAuthenticated, getAllAppointments);
router.put('/:id/status', isAuthenticated, updateAppointmentStatus);

module.exports = router;
