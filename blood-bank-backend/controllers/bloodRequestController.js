const BloodRequest = require('../models/BloodRequest');
const BloodSpecimen = require('../models/BloodSpecimen');
const HospitalInventory = require('../models/HospitalInventory');

// @desc    Create blood request (Hospital)
// @route   POST /api/hospital/requests
// @access  Private (Hospital)
exports.createRequest = async (req, res) => {
  try {
    const { bloodGroup, quantity, urgency, reason, patientDetails, requiredBy } = req.body;
    const hospitalId = req.hospital._id;

    if (!bloodGroup || !quantity || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide blood group, quantity, and reason' 
      });
    }

    const bloodRequest = await BloodRequest.create({
      hospitalId,
      hospitalName: req.hospital.Hosp_Name,
      hospitalEmail: req.hospital.email,
      bloodGroup,
      quantity,
      urgency: urgency || 'routine',
      reason,
      patientDetails,
      requiredBy,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: bloodRequest
    });
  } catch (error) {
    console.error('Error in createRequest:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get hospital's blood requests
// @route   GET /api/hospital/requests
// @access  Private (Hospital)
exports.getHospitalRequests = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;
    const { status, urgency } = req.query;

    const query = { hospitalId };
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .sort({ requestDate: -1 })
      .populate('respondedBy', 'username');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getHospitalRequests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single request details
// @route   GET /api/hospital/requests/:id
// @access  Private (Hospital)
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital._id;

    const request = await BloodRequest.findOne({ 
      _id: id, 
      hospitalId 
    }).populate('respondedBy', 'username');

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error in getRequestById:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Cancel request (Hospital)
// @route   PUT /api/hospital/requests/:id/cancel
// @access  Private (Hospital)
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.hospital._id;

    const request = await BloodRequest.findOne({ 
      _id: id, 
      hospitalId 
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel request with status: ${request.status}` 
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get request statistics for hospital
// @route   GET /api/hospital/requests/stats
// @access  Private (Hospital)
exports.getHospitalRequestStats = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      fulfilledRequests
    ] = await Promise.all([
      BloodRequest.countDocuments({ hospitalId }),
      BloodRequest.countDocuments({ hospitalId, status: 'pending' }),
      BloodRequest.countDocuments({ hospitalId, status: 'approved' }),
      BloodRequest.countDocuments({ hospitalId, status: 'rejected' }),
      BloodRequest.countDocuments({ hospitalId, status: 'fulfilled' })
    ]);

    const fulfillmentRate = totalRequests > 0 
      ? ((fulfilledRequests / totalRequests) * 100).toFixed(1) 
      : 0;

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        fulfilledRequests,
        fulfillmentRate: parseFloat(fulfillmentRate)
      }
    });
  } catch (error) {
    console.error('Error in getHospitalRequestStats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============= ADMIN SIDE =============

// @desc    Get all blood requests (Admin)
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, urgency, bloodGroup } = req.query;

    const query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query)
      .sort({ requestDate: -1 })
      .populate('hospitalId', 'Hosp_Name email Hosp_Phone')
      .populate('respondedBy', 'username');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getAllRequests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update request status (Admin)
// @route   PUT /api/admin/requests/:id/status
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    // Check blood availability when approving
    if (status === 'approved') {
      const availableBlood = await BloodSpecimen.countDocuments({
        B_Group: request.bloodGroup,
        Status: 'available'
      });

      if (availableBlood < request.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient blood inventory. Available: ${availableBlood} units, Requested: ${request.quantity} units`
        });
      }
    }

    // Reserve blood specimens when fulfilling
    if (status === 'fulfilled') {
      const availableSpecimens = await BloodSpecimen.find({
        B_Group: request.bloodGroup,
        Status: 'available'
      }).limit(request.quantity);

      if (availableSpecimens.length < request.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient blood specimens. Available: ${availableSpecimens.length} units, Requested: ${request.quantity} units`
        });
      }

      // Mark specimens as used
      await BloodSpecimen.updateMany(
        { 
          _id: { $in: availableSpecimens.map(s => s._id) }
        },
        { 
          Status: 'used',
          usedDate: new Date()
        }
      );

      // Add blood to hospital inventory
      const inventory = await HospitalInventory.findOne({
        hospitalId: request.hospitalId,
        bloodGroup: request.bloodGroup
      });

      if (inventory) {
        inventory.quantity += request.quantity;
        await inventory.save();
      } else {
        await HospitalInventory.create({
          hospitalId: request.hospitalId,
          bloodGroup: request.bloodGroup,
          quantity: request.quantity
        });
      }

      request.fulfillmentDate = new Date();
    }

    request.status = status;
    request.responseDate = new Date();
    request.respondedBy = req.user._id;
    request.respondedByName = req.user.username;
    if (adminNotes) request.adminNotes = adminNotes;

    await request.save();

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data: request
    });
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get request statistics (Admin)
// @route   GET /api/admin/requests/stats
// @access  Private (Admin)
exports.getAdminRequestStats = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      fulfilledRequests,
      emergencyRequests
    ] = await Promise.all([
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: 'approved' }),
      BloodRequest.countDocuments({ status: 'rejected' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      BloodRequest.countDocuments({ urgency: 'emergency', status: 'pending' })
    ]);

    // Calculate fulfillment rate based on non-pending, non-cancelled requests
    const completedRequests = approvedRequests + rejectedRequests + fulfilledRequests;
    const fulfillmentRate = completedRequests > 0 
      ? ((fulfilledRequests / completedRequests) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        fulfilledRequests,
        emergencyRequests,
        fulfillmentRate: parseFloat(fulfillmentRate)
      }
    });
  } catch (error) {
    console.error('Error in getAdminRequestStats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Check blood availability
// @route   GET /api/hospital/blood-availability/:bloodGroup
// @access  Private (Hospital)
exports.checkBloodAvailability = async (req, res) => {
  try {
    const { bloodGroup } = req.params;

    const availableBlood = await BloodSpecimen.countDocuments({
      B_Group: bloodGroup,
      Status: 'available'
    });

    res.json({
      success: true,
      data: {
        bloodGroup,
        availableUnits: availableBlood
      }
    });
  } catch (error) {
    console.error('Error in checkBloodAvailability:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
