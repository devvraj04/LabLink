const EmergencyRequest = require('../models/EmergencyRequest');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const DonorReward = require('../models/DonorReward');

// @desc    Create emergency blood request and broadcast to donors
// @route   POST /api/emergency/broadcast
// @access  Private (Admin or Hospital)
exports.createEmergencyBroadcast = async (req, res) => {
  try {
    const { bloodGroup, unitsNeeded, urgencyLevel, patientCondition, location } = req.body;
    
    // Get hospital ID and name from either hospital or admin request
    let hospitalId, hospitalName;
    
    if (req.hospital) {
      // Request from hospital
      hospitalId = req.hospital._id;
      hospitalName = req.hospital.Hosp_Name;
    } else if (req.user) {
      // Request from admin - must provide hospitalId and hospitalName in body
      hospitalId = req.body.hospitalId;
      hospitalName = req.body.hospitalName;
      
      if (!hospitalId || !hospitalName) {
        return res.status(400).json({
          success: false,
          message: 'Admin must provide hospitalId and hospitalName in request body'
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No valid user or hospital found'
      });
    }

    if (!bloodGroup || !unitsNeeded || !location?.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blood group, units needed, and location coordinates'
      });
    }

    // Create emergency request with 2-hour expiry
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const emergencyRequest = await EmergencyRequest.create({
      hospitalId,
      hospitalName,
      bloodGroup,
      unitsNeeded,
      urgencyLevel: urgencyLevel || 'urgent',
      patientCondition,
      location,
      expiresAt,
      status: 'active'
    });

    // Find matching donors within radius (50km)
    const radius = 50000; // meters
    const matchingDonors = await Donor.find({
      $or: [{ Bd_Bgroup: bloodGroup }, { bloodGroup: bloodGroup }]
    });

    // Create notifications for matching donors
    const notifications = matchingDonors.map(donor => ({
      recipientType: 'donor',
      recipientId: donor._id,
      recipientModel: 'Donor',
      bloodGroupFilter: bloodGroup,
      type: 'emergency',
      title: `🚨 EMERGENCY: ${bloodGroup} Blood Needed!`,
      message: `${hospitalName} urgently needs ${unitsNeeded} units of ${bloodGroup} blood. Patient condition: ${patientCondition}. Can you help?`,
      priority: urgencyLevel === 'critical' ? 'critical' : 'high',
      channels: ['in_app', 'sms', 'push'],
      metadata: {
        emergencyRequestId: emergencyRequest._id,
        hospitalId,
        unitsNeeded
      },
      actionUrl: `/emergency/${emergencyRequest._id}`,
      expiresAt
    }));

    await Notification.insertMany(notifications);

    emergencyRequest.donorsNotified = matchingDonors.length;
    await emergencyRequest.save();

    res.status(201).json({
      success: true,
      message: `Emergency broadcast sent to ${matchingDonors.length} ${bloodGroup} donors`,
      data: emergencyRequest
    });
  } catch (error) {
    console.error('Error creating emergency broadcast:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active emergency requests
// @route   GET /api/emergency/active
// @access  Public
exports.getActiveEmergencies = async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    
    const query = { 
      status: 'active',
      expiresAt: { $gt: new Date() }
    };
    
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const emergencies = await EmergencyRequest.find(query)
      .populate('hospitalId', 'Hosp_Name Hosp_Phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Donor responds to emergency request
// @route   POST /api/emergency/:id/respond
// @access  Public
exports.respondToEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorId, donorName, donorPhone, responseStatus, eta, distance } = req.body;

    const emergency = await EmergencyRequest.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    if (emergency.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This emergency request is no longer active'
      });
    }

    // Check if donor already responded
    const existingResponse = emergency.donorResponses.find(
      r => r.donorId.toString() === donorId
    );

    if (existingResponse) {
      existingResponse.responseStatus = responseStatus;
      existingResponse.eta = eta;
      existingResponse.distance = distance;
      existingResponse.responseTime = new Date();
    } else {
      emergency.donorResponses.push({
        donorId,
        donorName,
        donorPhone,
        responseStatus,
        eta,
        distance,
        responseTime: new Date()
      });
    }

    await emergency.save();

    // Award points if accepted
    if (responseStatus === 'accepted') {
      let reward = await DonorReward.findOne({ donorId });
      if (!reward) {
        reward = await DonorReward.create({ donorId, totalPoints: 0 });
      }
      
      reward.emergencyResponses += 1;
      reward.totalPoints += 200; // 200 points for emergency response
      reward.transactions.push({
        type: 'emergency_response',
        points: 200,
        description: `Emergency response for ${emergency.hospitalName}`,
        relatedId: emergency._id
      });
      
      await reward.save();
    }

    res.json({
      success: true,
      message: `Response recorded: ${responseStatus}`,
      data: emergency
    });
  } catch (error) {
    console.error('Error responding to emergency:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get emergency request by ID
// @route   GET /api/emergency/:id
// @access  Public
exports.getEmergencyById = async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate('hospitalId', 'Hosp_Name Hosp_Phone email');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    res.json({
      success: true,
      data: emergency
    });
  } catch (error) {
    console.error('Error fetching emergency:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id/status
// @access  Private (Admin/Hospital)
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const emergency = await EmergencyRequest.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    emergency.status = status;
    if (status === 'fulfilled') {
      emergency.fulfilledAt = new Date();
    }

    await emergency.save();

    res.json({
      success: true,
      message: `Emergency status updated to ${status}`,
      data: emergency
    });
  } catch (error) {
    console.error('Error updating emergency status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
