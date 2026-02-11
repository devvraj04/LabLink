const QRCode = require('qrcode');
const Donor = require('../models/Donor');
const BloodSpecimen = require('../models/BloodSpecimen');

// @desc    Generate QR code for donor
// @route   GET /api/qr/donor/:id
// @access  Public
exports.generateDonorQR = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    const donorData = {
      id: donor._id,
      name: donor.Bd_Name || donor.name,
      bloodGroup: donor.Bd_Bgroup || donor.bloodGroup,
      phone: donor.Bd_Phone || donor.phone,
      type: 'donor'
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(donorData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#DC2626',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        donorInfo: donorData
      }
    });
  } catch (error) {
    console.error('Error generating donor QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate QR code for blood specimen
// @route   GET /api/qr/specimen/:id
// @access  Private
exports.generateSpecimenQR = async (req, res) => {
  try {
    const specimen = await BloodSpecimen.findById(req.params.id)
      .populate('donor', 'Bd_Name Bd_Phone');

    if (!specimen) {
      return res.status(404).json({
        success: false,
        message: 'Blood specimen not found'
      });
    }

    const specimenData = {
      id: specimen._id,
      specimenNumber: specimen.specimenNumber,
      bloodGroup: specimen.bloodGroup || specimen.B_Group,
      collectionDate: specimen.collectionDate,
      expiryDate: specimen.expiryDate,
      status: specimen.status || specimen.Status,
      donorName: specimen.donor?.Bd_Name,
      type: 'specimen'
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(specimenData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#1E40AF',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        specimenInfo: specimenData
      }
    });
  } catch (error) {
    console.error('Error generating specimen QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Scan and decode QR code
// @route   POST /api/qr/scan
// @access  Private
exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data required'
      });
    }

    const decodedData = JSON.parse(qrData);

    if (decodedData.type === 'donor') {
      const donor = await Donor.findById(decodedData.id);
      return res.json({
        success: true,
        type: 'donor',
        data: donor
      });
    } else if (decodedData.type === 'specimen') {
      const specimen = await BloodSpecimen.findById(decodedData.id)
        .populate('donor');
      return res.json({
        success: true,
        type: 'specimen',
        data: specimen
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid QR code type'
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
