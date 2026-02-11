import React, { useState, useEffect } from 'react';
import { rewardsAPI } from '../services/api';
import { Trophy, Star, Award, TrendingUp, Users, Heart, Droplet, Zap, Medal, Crown, Gift } from 'lucide-react';

// Badge icon mapping
const BADGE_ICONS = {
  'First Donation': Droplet,
  'Life Saver': Heart,
  'Emergency Hero': Zap,
  'Regular Donor': Medal,
  'Champion': Crown,
  'Volunteer': Gift,
  'default': Award
};

const getBadgeIcon = (iconName) => {
  return BADGE_ICONS[iconName] || BADGE_ICONS['default'];
};

const RewardsPage = () => {
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const donorId = null; // TODO: Get actual donor ID from auth context when donor logs in

  useEffect(() => {
    // Only fetch donor rewards if valid donor ID exists
    if (donorId && donorId.match(/^[0-9a-fA-F]{24}$/)) {
      fetchRewards();
    } else {
      setLoading(false);
    }
    fetchLeaderboard();
  }, [donorId]);

  const fetchRewards = async () => {
    try {
      const response = await rewardsAPI.getDonorRewards(donorId);
      setRewards(response.data.data);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setRewards(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await rewardsAPI.getLeaderboard({ limit: 10 });
      const data = response.data.data || [];
      setLeaderboard(data);
      // Use top donor's stats for display when no user is logged in
      if (!donorId && data.length > 0) {
        setRewards(data[0]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-center"><div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Loading rewards...</p></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        Donor Rewards & Leaderboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8" />
            <span className="text-sm opacity-80">Total Points</span>
          </div>
          <div className="text-4xl font-bold mb-2">{rewards?.totalPoints || 0}</div>
          <div className="text-sm opacity-90">Rank: {rewards?.rank?.toUpperCase() || 'BEGINNER'}</div>
        </div>

        {/* Donations Card */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-8 w-8" />
            <span className="text-sm opacity-80">Total Donations</span>
          </div>
          <div className="text-4xl font-bold mb-2">{rewards?.totalDonations || 0}</div>
          <div className="text-sm opacity-90">Lives Saved: {rewards?.livesSaved || 0}</div>
        </div>

        {/* Emergency Responses */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8" />
            <span className="text-sm opacity-80">Emergency Responses</span>
          </div>
          <div className="text-4xl font-bold mb-2">{rewards?.emergencyResponses || 0}</div>
          <div className="text-sm opacity-90">Streak: {rewards?.currentStreak || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            My Badges
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {rewards?.badges && rewards.badges.length > 0 ? rewards.badges.map((badge, idx) => {
              const IconComponent = getBadgeIcon(badge.name);
              const levelColors = {
                bronze: 'text-orange-600 bg-orange-100',
                silver: 'text-zinc-500 bg-zinc-100',
                gold: 'text-yellow-600 bg-yellow-100',
                platinum: 'text-purple-600 bg-purple-100'
              };
              return (
                <div key={idx} className="text-center p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                  <div className={`w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center ${levelColors[badge.level] || 'text-blue-600 bg-blue-100'}`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <div className="text-sm font-medium text-zinc-800">{badge.name}</div>
                  <div className="text-xs text-zinc-500 capitalize">{badge.level}</div>
                </div>
              );
            }) : (
              <div className="col-span-3 text-center text-zinc-500 py-4">No badges yet. Start donating!</div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Top Donors
          </h2>
          <div className="space-y-2">
            {leaderboard.map((donor, idx) => (
              <div key={donor._id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-zinc-400' : idx === 2 ? 'bg-orange-600' : 'bg-zinc-300'
                    }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium">{donor.donorId?.Bd_Name || 'Unknown'}</div>
                    <div className="text-xs text-zinc-600">{donor.totalDonations} donations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{donor.totalPoints}</div>
                  <div className="text-xs text-zinc-600">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
