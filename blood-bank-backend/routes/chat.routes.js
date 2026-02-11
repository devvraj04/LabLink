const express = require('express');
const router = express.Router();
const {
  sendMessageFromHospital,
  getHospitalMessages,
  getHospitalUnreadCount,
  getAllConversations,
  getConversationMessages,
  sendMessageFromAdmin,
  getAdminUnreadCount
} = require('../controllers/chatController');
const isHospitalAuthenticated = require('../middleware/isHospitalAuthenticated');
const isAuthenticated = require('../middleware/isAuthenticated');

// Hospital routes
router.post('/hospital/send', isHospitalAuthenticated, sendMessageFromHospital);
router.get('/hospital/messages', isHospitalAuthenticated, getHospitalMessages);
router.get('/hospital/unread-count', isHospitalAuthenticated, getHospitalUnreadCount);

// Admin routes
router.get('/admin/conversations', isAuthenticated, getAllConversations);
router.get('/admin/messages/:hospitalId', isAuthenticated, getConversationMessages);
router.post('/admin/send/:hospitalId', isAuthenticated, sendMessageFromAdmin);
router.get('/admin/unread-count', isAuthenticated, getAdminUnreadCount);

module.exports = router;
