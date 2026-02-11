const HospitalInventory = require('../models/HospitalInventory');

// @desc    Get hospital inventory
// @route   GET /api/hospital/inventory
// @access  Private (Hospital)
exports.getHospitalInventory = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;

    const inventory = await HospitalInventory.find({ hospitalId })
      .sort({ bloodGroup: 1 });

    // If no inventory exists, return empty array with all blood groups at 0
    if (inventory.length === 0) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const emptyInventory = bloodGroups.map(bg => ({
        bloodGroup: bg,
        quantity: 0,
        hospitalId
      }));
      
      return res.json({
        success: true,
        data: emptyInventory
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error in getHospitalInventory:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get hospital inventory summary (for dashboard)
// @route   GET /api/hospital/inventory/summary
// @access  Private (Hospital)
exports.getInventorySummary = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;

    const inventory = await HospitalInventory.find({ hospitalId });

    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const bloodTypesAvailable = inventory.filter(item => item.quantity > 0).length;

    res.json({
      success: true,
      data: {
        totalUnits,
        bloodTypesAvailable,
        inventory: inventory.sort((a, b) => b.quantity - a.quantity).slice(0, 5) // Top 5
      }
    });
  } catch (error) {
    console.error('Error in getInventorySummary:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
