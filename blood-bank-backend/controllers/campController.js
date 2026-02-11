const DonationCamp = require('../models/DonationCamp');
const Notification = require('../models/Notification');
const Donor = require('../models/Donor');
const BloodSpecimen = require('../models/BloodSpecimen');
const DonorReward = require('../models/DonorReward');

// @desc    Create donation camp
// @route   POST /api/camps
// @access  Private (Admin)
exports.createCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.create({
      ...req.body,
      createdBy: req.user?._id
    });

    // Broadcast to all donors
    const donors = await Donor.find({});
    
    const notifications = donors.map(donor => ({
      recipientType: 'donor',
      recipientId: donor._id,
      recipientModel: 'Donor',
      type: 'camp_invitation',
      title: `🏕️ Blood Donation Camp: ${camp.campName}`,
      message: `Join us on ${new Date(camp.campDate).toLocaleDateString()} at ${camp.location.name}. Register now!`,
      priority: 'medium',
      channels: ['in_app', 'sms'],
      metadata: { campId: camp._id },
      actionUrl: `/camps/${camp._id}`
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Camp created and notified ${donors.length} donors`,
      data: camp
    });
  } catch (error) {
    console.error('Error creating camp:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
exports.getAllCamps = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const camps = await DonationCamp.find(query)
      .sort({ campDate: -1 });

    res.json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    console.error('Error fetching camps:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming camps
// @route   GET /api/camps/upcoming
// @access  Public
exports.getUpcomingCamps = async (req, res) => {
  try {
    const camps = await DonationCamp.find({
      campDate: { $gte: new Date() },
      status: { $in: ['upcoming', 'ongoing'] }
    }).sort({ campDate: 1 });

    res.json({
      success: true,
      count: camps.length,
      data: camps
    });
  } catch (error) {
    console.error('Error fetching upcoming camps:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register for camp
// @route   POST /api/camps/:id/register
// @access  Public
exports.registerForCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const { donorId, donorName, donorPhone, donorEmail, bloodGroup } = req.body;

    // Validate required fields
    if (!donorName || !donorPhone || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donor name, phone, and blood group'
      });
    }

    const camp = await DonationCamp.findById(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    if (camp.status === 'completed' || camp.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this camp'
      });
    }

    // Check if already registered (by donorId or phone)
    const existing = camp.registrations.find(
      r => (r.donorId && donorId && r.donorId.toString() === donorId.toString()) || 
           (r.donorPhone === donorPhone)
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this camp'
      });
    }

    camp.registrations.push({
      donorId: donorId || null,
      donorName,
      donorPhone,
      donorEmail,
      bloodGroup
    });

    await camp.save();

    res.json({
      success: true,
      message: 'Successfully registered for camp!',
      data: camp
    });
  } catch (error) {
    console.error('Error registering for camp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register for camp'
    });
  }
};

// @desc    Mark attendance
// @route   PUT /api/camps/:id/attendance/:registrationId
// @access  Private (Admin)
exports.markAttendance = async (req, res) => {
  try {
    const { id, registrationId } = req.params;
    const { attended, donated } = req.body;

    const camp = await DonationCamp.findById(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    const registration = camp.registrations.id(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    registration.attended = attended;
    registration.donated = donated;

    if (donated) {
      camp.unitsCollected += 1;

      // Create blood specimen
      const specimenCount = await BloodSpecimen.countDocuments();
      const specimenNumber = `SP${String(specimenCount + 1).padStart(6, '0')}`;
      
      const collectionDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 42);

      await BloodSpecimen.create({
        specimenNumber,
        bloodGroup: registration.bloodGroup,
        B_Group: registration.bloodGroup,
        status: 'available',
        Status: 'available',
        collectionDate,
        expiryDate,
        donor: registration.donorId
      });

      // Award points
      if (registration.donorId) {
        let reward = await DonorReward.findOne({ donorId: registration.donorId });
        if (!reward) {
          reward = await DonorReward.create({ donorId: registration.donorId });
        }

        reward.totalDonations += 1;
        reward.totalPoints += 150; // Bonus for camp donation
        reward.livesSaved += 1;
        
        reward.transactions.push({
          type: 'camp_attendance',
          points: 150,
          description: `Donation at ${camp.campName}`,
          relatedId: camp._id
        });

        await reward.save();
      }
    }

    await camp.save();

    res.json({
      success: true,
      message: 'Attendance marked',
      data: camp
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update camp status
// @route   PUT /api/camps/:id/status
// @access  Private (Admin)
exports.updateCampStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const camp = await DonationCamp.findById(id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found'
      });
    }

    camp.status = status;
    await camp.save();

    res.json({
      success: true,
      message: `Camp status updated to ${status}`,
      data: camp
    });
  } catch (error) {
    console.error('Error updating camp status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
