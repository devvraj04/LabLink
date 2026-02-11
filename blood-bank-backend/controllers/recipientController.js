const Recipient = require('../models/Recipient');
const BloodSpecimen = require('../models/BloodSpecimen');

// @desc    Get all recipients
// @route   GET /api/recipients
// @access  Private (staff, manager)
exports.getAllRecipients = async (req, res) => {
  try {
    const { bloodGroup, status, page = 1, limit = 1000 } = req.query; // Increased default limit to 1000

    // Build query
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;

    // Execute query with pagination
    const recipients = await Recipient.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ requestDate: -1 });

    const count = await Recipient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: recipients.length,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      data: recipients,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get single recipient
// @route   GET /api/recipients/:id
// @access  Private (staff, manager)
exports.getRecipientById = async (req, res) => {
  try {
    const recipient = await Recipient.findById(req.params.id);

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Create new recipient
// @route   POST /api/recipients
// @access  Private (staff, manager)
exports.createRecipient = async (req, res) => {
  try {
    const recipient = await Recipient.create(req.body);

    // Automatically reduce inventory by marking blood specimens as "used"
    const bloodGroup = recipient.Reci_Bgrp || recipient.bloodGroup;
    const quantity = recipient.Reci_Bqty || recipient.bloodQuantity || 1;

    if (bloodGroup && quantity > 0) {
      // Find available blood specimens of matching blood group
      const availableSpecimens = await BloodSpecimen.find({
        $or: [
          { B_Group: bloodGroup },
          { bloodGroup: bloodGroup }
        ],
        $or: [
          { Status: 'available' },
          { status: 'available' }
        ]
      })
        .limit(quantity)
        .sort({ collectionDate: 1 }); // Use oldest blood first (FIFO)

      if (availableSpecimens.length < quantity) {
        // Not enough blood in inventory
        return res.status(400).json({
          success: false,
          message: `Insufficient blood inventory. Available: ${availableSpecimens.length} units, Required: ${quantity} units`,
          data: { recipient }
        });
      }

      // Mark specimens as "used"
      const specimenIds = availableSpecimens.map(s => s._id);
      await BloodSpecimen.updateMany(
        { _id: { $in: specimenIds } },
        {
          $set: {
            Status: 'used',
            status: 'used',
            usedDate: new Date()
          }
        }
      );

      res.status(201).json({
        success: true,
        message: `Recipient created successfully and ${quantity} units of ${bloodGroup} blood marked as used`,
        data: {
          recipient,
          bloodUsed: {
            bloodGroup,
            quantity,
            specimenIds: availableSpecimens.map(s => s.specimenNumber || s._id)
          }
        }
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Recipient created successfully',
        data: recipient,
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create recipient',
      error: error.message 
    });
  }
};

// @desc    Update recipient
// @route   PUT /api/recipients/:id
// @access  Private (staff, manager)
exports.updateRecipient = async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recipient updated successfully',
      data: recipient,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update recipient',
      error: error.message 
    });
  }
};

// @desc    Delete recipient
// @route   DELETE /api/recipients/:id
// @access  Private (manager only)
exports.deleteRecipient = async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndDelete(req.params.id);

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully',
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

// @desc    Update recipient status
// @route   PATCH /api/recipients/:id/status
// @access  Private (manager only)
exports.updateRecipientStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'fulfilled', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const recipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recipient status updated successfully',
      data: recipient,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to update status',
      error: error.message 
    });
  }
};
