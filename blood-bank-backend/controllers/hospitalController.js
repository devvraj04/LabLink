const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private (staff, manager)
exports.getAllHospitals = async (req, res) => {
  try {
    const { city, page = 1, limit = 1000 } = req.query; // Increased default limit to 1000

    // Build query
    let query = {};
    if (city) query.city = new RegExp(city, 'i');

    // Execute query with pagination
    const hospitals = await Hospital.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const count = await Hospital.countDocuments(query);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Private (staff, manager)
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Create new hospital
// @route   POST /api/hospitals
// @access  Private (manager only)
exports.createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create hospital',
      error: error.message 
    });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private (manager only)
exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: hospital,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update hospital',
      error: error.message 
    });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (manager only)
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Approve/Reject hospital account
// @route   PUT /api/hospitals/:id/approval
// @access  Private (manager only)
exports.updateHospitalApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    if (isApproved === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide isApproved status' 
      });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: `Hospital ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get pending hospital approvals
// @route   GET /api/hospitals/pending
// @access  Private (manager only)
exports.getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ 
      isApproved: false,
      password: { $exists: true, $ne: null } // Only show hospitals that registered with credentials
    }).sort({ registrationDate: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
