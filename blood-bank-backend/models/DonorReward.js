const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['donation', 'emergency_response', 'referral', 'streak_bonus', 'camp_attendance'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const donorRewardSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  emergencyResponses: {
    type: Number,
    default: 0
  },
  referrals: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  badges: [{
    name: { type: String },
    level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'] },
    earnedDate: { type: Date, default: Date.now },
    icon: { type: String }
  }],
  transactions: [rewardTransactionSchema],
  rank: {
    type: String,
    enum: ['beginner', 'contributor', 'hero', 'legend', 'lifesaver'],
    default: 'beginner'
  },
  lastDonationDate: {
    type: Date
  },
  livesSaved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate rank based on total points
donorRewardSchema.pre('save', function(next) {
  if (this.totalPoints >= 1000) {
    this.rank = 'lifesaver';
  } else if (this.totalPoints >= 500) {
    this.rank = 'legend';
  } else if (this.totalPoints >= 250) {
    this.rank = 'hero';
  } else if (this.totalPoints >= 100) {
    this.rank = 'contributor';
  } else {
    this.rank = 'beginner';
  }
  next();
});

donorRewardSchema.index({ totalPoints: -1 });
donorRewardSchema.index({ donorId: 1 });

module.exports = mongoose.model('DonorReward', donorRewardSchema);
