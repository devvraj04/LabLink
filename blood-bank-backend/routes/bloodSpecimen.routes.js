const express = require('express');
const router = express.Router();
const {
  getAllBloodSpecimens,
  getBloodSpecimenById,
  createBloodSpecimen,
  updateBloodSpecimen,
  deleteBloodSpecimen,
  getInventoryStats,
  updateSpecimenStatus,
} = require('../controllers/bloodSpecimenController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAuthorized = require('../middleware/isAuthorized');

// All routes require authentication
router.use(isAuthenticated);

// Statistics route (before :id route to avoid conflict)
router.get('/stats/inventory', getInventoryStats);

// CRUD routes
router.route('/')
  .get(getAllBloodSpecimens)  // Accessible by staff and manager
  .post(createBloodSpecimen);  // Accessible by staff and manager

router.route('/:id')
  .get(getBloodSpecimenById)  // Accessible by staff and manager
  .put(updateBloodSpecimen)   // Accessible by staff and manager
  .delete(isAuthorized('manager'), deleteBloodSpecimen);  // Only manager can delete

// Status update route
router.patch('/:id/status', updateSpecimenStatus);

module.exports = router;
