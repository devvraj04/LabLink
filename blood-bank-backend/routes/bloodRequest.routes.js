const express = require('express');
const router = express.Router();
const {
  createRequest,
  getHospitalRequests,
  getRequestById,
  cancelRequest,
  getHospitalRequestStats,
  checkBloodAvailability,
  getAllRequests,
  updateRequestStatus,
  getAdminRequestStats
} = require('../controllers/bloodRequestController');
const {
  getHospitalInventory,
  getInventorySummary
} = require('../controllers/hospitalInventoryController');
const isHospitalAuthenticated = require('../middleware/isHospitalAuthenticated');
const isAuthenticated = require('../middleware/isAuthenticated');

// Hospital routes - IMPORTANT: Specific routes must come BEFORE dynamic :id routes
router.post('/hospital', isHospitalAuthenticated, createRequest);
router.get('/hospital', isHospitalAuthenticated, getHospitalRequests);
router.get('/hospital/stats', isHospitalAuthenticated, getHospitalRequestStats);
router.get('/hospital/inventory/summary', isHospitalAuthenticated, getInventorySummary);
router.get('/hospital/inventory', isHospitalAuthenticated, getHospitalInventory);
router.get('/hospital/blood-availability/:bloodGroup', isHospitalAuthenticated, checkBloodAvailability);
router.get('/hospital/:id', isHospitalAuthenticated, getRequestById);
router.put('/hospital/:id/cancel', isHospitalAuthenticated, cancelRequest);

// Admin routes
router.get('/admin', isAuthenticated, getAllRequests);
router.get('/admin/stats', isAuthenticated, getAdminRequestStats);
router.put('/admin/:id/status', isAuthenticated, updateRequestStatus);

module.exports = router;
