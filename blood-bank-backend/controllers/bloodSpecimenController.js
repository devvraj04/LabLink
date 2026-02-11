const BloodSpecimen = require('../models/BloodSpecimen');

// @desc    Get all blood specimens
// @route   GET /api/blood-specimens
// @access  Private (staff, manager)
exports.getAllBloodSpecimens = async (req, res) => {
  try {
    const { bloodGroup, status, page = 1, limit = 1000 } = req.query; // Increased default limit to 1000

    // Build query
    let query = {};
    if (bloodGroup) query.B_Group = bloodGroup;
    if (status) query.status = status;

    // Execute query with pagination
    const specimens = await BloodSpecimen.find(query)
      .populate('donor', 'name bloodGroup')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await BloodSpecimen.countDocuments(query);

    res.status(200).json({
      success: true,
      count: specimens.length,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: specimens,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get single blood specimen
// @route   GET /api/blood-specimens/:id
// @access  Private (staff, manager)
exports.getBloodSpecimenById = async (req, res) => {
  try {
    const specimen = await BloodSpecimen.findById(req.params.id)
      .populate('donor', 'name bloodGroup phone city');

    if (!specimen) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood specimen not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: specimen,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Create new blood specimen
// @route   POST /api/blood-specimens
// @access  Private (staff, manager)
exports.createBloodSpecimen = async (req, res) => {
  try {
    // Generate unique specimen number if not provided
    if (!req.body.specimenNumber) {
      const specimenCount = await BloodSpecimen.countDocuments();
      req.body.specimenNumber = `SP${String(specimenCount + 1).padStart(6, '0')}`;
    }

    // Sync fields for backward compatibility
    if (req.body.B_Group) {
      req.body.bloodGroup = req.body.B_Group;
    }
    if (req.body.Status) {
      req.body.status = req.body.Status;
    }

    const specimen = await BloodSpecimen.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Blood specimen created successfully',
      data: specimen,
    });
  } catch (error) {
    console.error('Error creating blood specimen:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create blood specimen',
      error: error.message 
    });
  }
};

// @desc    Update blood specimen
// @route   PUT /api/blood-specimens/:id
// @access  Private (staff, manager)
exports.updateBloodSpecimen = async (req, res) => {
  try {
    const specimen = await BloodSpecimen.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!specimen) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood specimen not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood specimen updated successfully',
      data: specimen,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update blood specimen',
      error: error.message 
    });
  }
};

// @desc    Delete blood specimen
// @route   DELETE /api/blood-specimens/:id
// @access  Private (manager only)
exports.deleteBloodSpecimen = async (req, res) => {
  try {
    const specimen = await BloodSpecimen.findByIdAndDelete(req.params.id);

    if (!specimen) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood specimen not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood specimen deleted successfully',
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

// @desc    Get blood specimen inventory stats
// @route   GET /api/blood-specimens/stats/inventory
// @access  Private (staff, manager)
exports.getInventoryStats = async (req, res) => {
  try {
    const stats = await BloodSpecimen.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Transform array to object format {A+: 5, O+: 3, etc.}
    const byBloodGroup = {};
    stats.forEach(item => {
      byBloodGroup[item._id] = item.count;
    });

    const totalUnits = await BloodSpecimen.countDocuments();
    const availableUnits = await BloodSpecimen.countDocuments({ status: 'available' });

    res.status(200).json({
      success: true,
      data: {
        totalUnits,
        available: availableUnits,
        byBloodGroup,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update specimen status
// @route   PATCH /api/blood-specimens/:id/status
// @access  Private (staff, manager)
exports.updateSpecimenStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'reserved', 'used', 'contaminated'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const specimen = await BloodSpecimen.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!specimen) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood specimen not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood specimen status updated successfully',
      data: specimen,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update status',
      error: error.message 
    });
  }
};
