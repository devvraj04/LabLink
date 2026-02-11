const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getBloodDemandForecast
} = require('../controllers/analyticsController');
const isAuthenticated = require('../middleware/isAuthenticated');

// All analytics routes require authentication
router.get('/dashboard', isAuthenticated, getDashboardAnalytics);
router.get('/forecast', isAuthenticated, getBloodDemandForecast);

module.exports = router;
