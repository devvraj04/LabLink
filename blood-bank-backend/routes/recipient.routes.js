const express = require('express');
const router = express.Router();
const {
  getAllRecipients,
  getRecipientById,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  updateRecipientStatus,
} = require('../controllers/recipientController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAuthorized = require('../middleware/isAuthorized');

// All routes require authentication
router.use(isAuthenticated);

// CRUD routes
router.route('/')
  .get(getAllRecipients)  // Accessible by staff and manager
  .post(createRecipient);  // Accessible by staff and manager

router.route('/:id')
  .get(getRecipientById)  // Accessible by staff and manager
  .put(updateRecipient)   // Accessible by staff and manager
  .delete(isAuthorized('manager'), deleteRecipient);  // Only manager can delete

// Status update route (manager only)
router.patch('/:id/status', isAuthorized('manager'), updateRecipientStatus);

module.exports = router;
