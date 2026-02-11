const express = require('express');
const router = express.Router();
const {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonorStats,
} = require('../controllers/donorController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAuthorized = require('../middleware/isAuthorized');

// All routes require authentication
router.use(isAuthenticated);

// Statistics route (before :id route to avoid conflict)
router.get('/stats', getDonorStats);

// CRUD routes
router.route('/')
  .get(getAllDonors)  // Accessible by staff and manager
  .post(createDonor);  // Accessible by staff and manager

router.route('/:id')
  .get(getDonorById)  // Accessible by staff and manager
  .put(updateDonor)   // Accessible by staff and manager
  .delete(isAuthorized('manager'), deleteDonor);  // Only manager can delete

module.exports = router;
