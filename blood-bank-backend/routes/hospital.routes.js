const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  updateHospitalApproval,
  getPendingHospitals,
} = require('../controllers/hospitalController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAuthorized = require('../middleware/isAuthorized');

// All routes require authentication
router.use(isAuthenticated);

// Get pending hospitals (manager only)
router.get('/pending', isAuthorized('manager'), getPendingHospitals);

// Approve/Reject hospital (manager only)
router.put('/:id/approval', isAuthorized('manager'), updateHospitalApproval);

// CRUD routes
router.route('/')
  .get(getAllHospitals)  // Accessible by staff and manager
  .post(isAuthorized('manager'), createHospital);  // Only manager can create

router.route('/:id')
  .get(getHospitalById)  // Accessible by staff and manager
  .put(isAuthorized('manager'), updateHospital)   // Only manager can update
  .delete(isAuthorized('manager'), deleteHospital);  // Only manager can delete

module.exports = router;
