import React from 'react';
import { Heart, Droplets, Award, TrendingUp, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DonorImpactTracker = ({ donorData }) => {
  const { info } = useToast();
  const {
    totalDonations = 0,
    livesSaved = 0,
    totalPoints = 0,
    rank = 'beginner',
    donations = []
  } = donorData || {};

  const calculateLivesSaved = (donations) => {
    return Math.floor(donations * 3); // Each donation can save up to 3 lives
  };

  const lives = livesSaved || calculateLivesSaved(totalDonations);

  const downloadCertificate = () => {
    info('Coming Soon!', 'Certificate download feature will be available soon');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <Heart className="h-7 w-7 text-red-500" />
        Your Impact on Lives
      </h2>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 text-center">
          <Heart className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <div className="text-4xl font-bold text-red-600 mb-2">{lives}</div>
          <div className="text-sm text-red-800 font-medium">Lives Saved</div>
          <p className="text-xs text-red-700 mt-2">Every donation can save up to 3 lives</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
          <Droplets className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <div className="text-4xl font-bold text-blue-600 mb-2">{totalDonations}</div>
          <div className="text-sm text-blue-800 font-medium">Total Donations</div>
          <p className="text-xs text-blue-700 mt-2">You're making a difference!</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
          <Award className="h-10 w-10 text-purple-600 mx-auto mb-3" />
          <div className="text-4xl font-bold text-purple-600 mb-2">{totalPoints}</div>
          <div className="text-sm text-purple-800 font-medium">Reward Points</div>
          <p className="text-xs text-purple-700 mt-2 capitalize">Rank: {rank}</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Milestones Achieved
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {totalDonations >= 1 && (
            <div className="bg-zinc-50 rounded-lg p-3 text-center border-2 border-green-200">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-xs font-medium">First Donation</div>
            </div>
          )}
          {totalDonations >= 5 && (
            <div className="bg-zinc-50 rounded-lg p-3 text-center border-2 border-green-200">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-xs font-medium">5 Donations</div>
            </div>
          )}
          {totalDonations >= 10 && (
            <div className="bg-zinc-50 rounded-lg p-3 text-center border-2 border-green-200">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-medium">10 Donations</div>
            </div>
          )}
          {totalDonations >= 25 && (
            <div className="bg-zinc-50 rounded-lg p-3 text-center border-2 border-green-200">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-xs font-medium">25 Donations</div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {donations && donations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Recent Donation Timeline</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {donations.slice(0, 10).map((donation, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Droplets className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{donation.bloodGroup || 'Blood Donation'}</div>
                  <div className="text-sm text-zinc-600">
                    {new Date(donation.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-green-600 font-medium text-sm">+{donation.points || 100} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Download Impact Certificate</h3>
            <p className="text-sm opacity-90">Show your contribution to the community</p>
          </div>
          <button
            onClick={downloadCertificate}
            className="bg-white text-blue-600 hover:bg-zinc-100 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorImpactTracker;
