const BloodSpecimen = require('../models/BloodSpecimen');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const DonationCamp = require('../models/DonationCamp');
const EmergencyRequest = require('../models/EmergencyRequest');
const BloodRequest = require('../models/BloodRequest');
const DonorReward = require('../models/DonorReward');

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Blood inventory analytics
    const inventoryStats = await BloodSpecimen.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          },
          reserved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0]
            }
          },
          used: {
            $sum: {
              $cond: [{ $eq: ['$status', 'used'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Donor statistics
    const totalDonors = await Donor.countDocuments();
    const donorsThisMonth = await Donor.countDocuments({
      $or: [
        { Bd_reg_Date: { $gte: startOfMonth } },
        { registrationDate: { $gte: startOfMonth } }
      ]
    });
    const donorsThisYear = await Donor.countDocuments({
      $or: [
        { Bd_reg_Date: { $gte: startOfYear } },
        { registrationDate: { $gte: startOfYear } }
      ]
    });

    // Donation trends (last 12 months)
    const donationTrends = await BloodSpecimen.aggregate([
      {
        $match: {
          collectionDate: { $gte: new Date(now.setMonth(now.getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$collectionDate' },
            year: { $year: '$collectionDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Hospital request statistics
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const rejectedRequests = await BloodRequest.countDocuments({ status: 'rejected' });
    
    const fulfillmentRate = totalRequests > 0 
      ? ((fulfilledRequests / totalRequests) * 100).toFixed(1)
      : 0;

    // Emergency response stats
    const emergencyStats = {
      total: await EmergencyRequest.countDocuments(),
      active: await EmergencyRequest.countDocuments({ status: 'active' }),
      fulfilled: await EmergencyRequest.countDocuments({ status: 'fulfilled' }),
      avgResponseTime: await calculateAvgResponseTime()
    };

    // Appointment statistics
    const appointmentStats = {
      total: await Appointment.countDocuments(),
      scheduled: await Appointment.countDocuments({ status: 'scheduled' }),
      completed: await Appointment.countDocuments({ status: 'completed' }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' }),
      noShow: await Appointment.countDocuments({ status: 'no-show' })
    };

    // Camp statistics
    const campStats = {
      total: await DonationCamp.countDocuments(),
      upcoming: await DonationCamp.countDocuments({ status: 'upcoming' }),
      completed: await DonationCamp.countDocuments({ status: 'completed' }),
      totalUnitsCollected: await DonationCamp.aggregate([
        { $group: { _id: null, total: { $sum: '$unitsCollected' } } }
      ])
    };

    // Top donors
    const topDonors = await DonorReward.find()
      .populate('donorId', 'Bd_Name Bd_Bgroup')
      .sort({ totalPoints: -1 })
      .limit(10);

    // Blood expiry alerts
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringUnits = await BloodSpecimen.countDocuments({
      expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() },
      status: 'available'
    });

    // Low stock alerts (< 5 units)
    const lowStockGroups = inventoryStats
      .filter(group => group.available < 5)
      .map(group => group._id);

    res.json({
      success: true,
      data: {
        inventory: {
          byBloodGroup: inventoryStats,
          total: inventoryStats.reduce((sum, g) => sum + g.total, 0),
          available: inventoryStats.reduce((sum, g) => sum + g.available, 0),
          lowStockGroups,
          expiringUnits
        },
        donors: {
          total: totalDonors,
          thisMonth: donorsThisMonth,
          thisYear: donorsThisYear,
          topDonors
        },
        donations: {
          trends: donationTrends
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          fulfilled: fulfilledRequests,
          rejected: rejectedRequests,
          fulfillmentRate: parseFloat(fulfillmentRate)
        },
        emergencies: emergencyStats,
        appointments: appointmentStats,
        camps: {
          ...campStats,
          totalUnitsCollected: campStats.totalUnitsCollected[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get blood demand forecast
// @route   GET /api/analytics/forecast
// @access  Private (Admin)
exports.getBloodDemandForecast = async (req, res) => {
  try {
    // Analyze historical patterns
    const pastMonthRequests = await BloodRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
          }
        }
      },
      {
        $group: {
          _id: '$bloodGroup',
          avgQuantity: { $avg: '$quantity' },
          totalRequests: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: pastMonthRequests
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate average response time
async function calculateAvgResponseTime() {
  try {
    const emergencies = await EmergencyRequest.find({ status: 'fulfilled' });
    
    if (emergencies.length === 0) return 0;

    const totalResponseTime = emergencies.reduce((sum, emergency) => {
      const acceptedResponses = emergency.donorResponses.filter(
        r => r.responseStatus === 'accepted'
      );
      
      if (acceptedResponses.length === 0) return sum;
      
      const responseTime = acceptedResponses[0].responseTime - emergency.createdAt;
      return sum + responseTime;
    }, 0);

    return Math.round(totalResponseTime / emergencies.length / 1000 / 60); // in minutes
  } catch (error) {
    return 0;
  }
}

module.exports = exports;
