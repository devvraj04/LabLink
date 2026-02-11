const Donor = require('../models/Donor');
const BloodSpecimen = require('../models/BloodSpecimen');

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private (staff, manager)
exports.getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, city, page = 1, limit = 1000 } = req.query; // Increased default limit to 1000

    // Build query
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(city, 'i');

    // Execute query with pagination
    const donors = await Donor.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ registrationDate: -1 });

    const count = await Donor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: donors.length,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: donors,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get single donor
// @route   GET /api/donors/:id
// @access  Private (staff, manager)
exports.getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Create new donor
// @route   POST /api/donors
// @access  Private (staff, manager)
exports.createDonor = async (req, res) => {
  try {
    // Create donor
    const donor = await Donor.create(req.body);

    // Automatically create blood specimen for this donation
    const collectionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42); // Blood expires in 42 days

    // Generate unique specimen number
    const specimenCount = await BloodSpecimen.countDocuments();
    const specimenNumber = `SP${String(specimenCount + 1).padStart(6, '0')}`;

    const bloodSpecimen = await BloodSpecimen.create({
      specimenNumber,
      bloodGroup: donor.bloodGroup,
      B_Group: donor.bloodGroup,
      Status: 'available',
      status: 'available',
      collectionDate,
      expiryDate,
      donor: donor._id
    });

    res.status(201).json({
      success: true,
      message: 'Donor created successfully and blood specimen added to inventory',
      data: {
        donor,
        bloodSpecimen: {
          id: bloodSpecimen._id,
          specimenNumber: bloodSpecimen.specimenNumber,
          bloodGroup: bloodSpecimen.bloodGroup,
          status: bloodSpecimen.status
        }
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create donor',
      error: error.message 
    });
  }
};

// @desc    Update donor
// @route   PUT /api/donors/:id
// @access  Private (staff, manager)
exports.updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!donor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update donor',
      error: error.message 
    });
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (manager only)
exports.deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
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

// @desc    Get donor statistics
// @route   GET /api/donors/stats
// @access  Private (staff, manager)
exports.getDonorStats = async (req, res) => {
  try {
    const stats = await Donor.aggregate([
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

    const totalDonors = await Donor.countDocuments();

    // Calculate donors this month (check both Bd_reg_Date and registrationDate for backward compatibility)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const donorsThisMonth = await Donor.countDocuments({
      $or: [
        { Bd_reg_Date: { $gte: startOfMonth } },
        { registrationDate: { $gte: startOfMonth } }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        totalDonors,
        thisMonth: donorsThisMonth,
        byBloodGroup: stats,
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
