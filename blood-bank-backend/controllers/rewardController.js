const DonorReward = require('../models/DonorReward');
const Donor = require('../models/Donor');

// @desc    Get donor rewards/points
// @route   GET /api/rewards/donor/:donorId
// @access  Public
exports.getDonorRewards = async (req, res) => {
  try {
    const { donorId } = req.params;
    
    // Validate ObjectId format
    if (!donorId || !donorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID format'
      });
    }
    
    let reward = await DonorReward.findOne({ donorId })
      .populate('donorId', 'Bd_Name Bd_Phone Bd_Bgroup');

    if (!reward) {
      // Create new reward record if doesn't exist
      reward = await DonorReward.create({ 
        donorId: donorId,
        totalPoints: 0,
        transactions: []
      });
      reward = await DonorReward.findById(reward._id)
        .populate('donorId', 'Bd_Name Bd_Phone Bd_Bgroup');
    }

    res.json({
      success: true,
      data: reward
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, period = 'all' } = req.query;

    let query = {};
    
    if (period === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query.updatedAt = { $gte: startOfMonth };
    }

    const leaderboard = await DonorReward.find(query)
      .populate('donorId', 'Bd_Name Bd_Bgroup')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Award badge to donor
// @route   POST /api/rewards/badge
// @access  Private (Admin)
exports.awardBadge = async (req, res) => {
  try {
    const { donorId, badgeName, level, icon } = req.body;

    const reward = await DonorReward.findOne({ donorId });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Donor reward record not found'
      });
    }

    // Check if badge already exists
    const existingBadge = reward.badges.find(b => b.name === badgeName);
    
    if (existingBadge) {
      existingBadge.level = level;
      existingBadge.earnedDate = new Date();
    } else {
      reward.badges.push({
        name: badgeName,
        level,
        icon: icon || '🏅',
        earnedDate: new Date()
      });
    }

    await reward.save();

    res.json({
      success: true,
      message: `${badgeName} badge awarded!`,
      data: reward
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reward statistics
// @route   GET /api/rewards/stats
// @access  Private (Admin)
exports.getRewardStats = async (req, res) => {
  try {
    const totalDonors = await DonorReward.countDocuments();
    const totalPoints = await DonorReward.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);
    const totalDonations = await DonorReward.aggregate([
      { $group: { _id: null, total: { $sum: '$totalDonations' } } }
    ]);

    const rankDistribution = await DonorReward.aggregate([
      { $group: { _id: '$rank', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalDonors,
        totalPoints: totalPoints[0]?.total || 0,
        totalDonations: totalDonations[0]?.total || 0,
        rankDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reward stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
