const express = require('express');
const router = express.Router();
const {
  getDonorRewards,
  getLeaderboard,
  awardBadge,
  getRewardStats
} = require('../controllers/rewardController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.get('/donor/:donorId', getDonorRewards);
router.get('/leaderboard', getLeaderboard);

// Admin routes
router.post('/badge', isAuthenticated, awardBadge);
router.get('/stats', isAuthenticated, getRewardStats);

module.exports = router;
