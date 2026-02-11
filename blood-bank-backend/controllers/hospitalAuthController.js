const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'hospital' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new hospital
// @route   POST /api/hospital/auth/register
// @access  Public
exports.registerHospital = async (req, res) => {
  try {
    const { 
      Hosp_Name, 
      email, 
      password, 
      Hosp_Phone, 
      City_Id,
      address 
    } = req.body;

    // Validation
    if (!Hosp_Name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide hospital name, email and password' 
      });
    }

    // Check if email already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create hospital (isApproved will be false by default)
    const hospital = await Hospital.create({
      Hosp_Name,
      name: Hosp_Name,
      email,
      password,
      Hosp_Phone,
      phone: Hosp_Phone,
      City_Id,
      address,
      registrationDate: new Date()
    });

    // Generate token
    const token = generateToken(hospital._id);

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Awaiting admin approval.',
      data: {
        _id: hospital._id,
        Hosp_Name: hospital.Hosp_Name,
        email: hospital.email,
        Hosp_Phone: hospital.Hosp_Phone,
        isApproved: hospital.isApproved,
        token
      }
    });
  } catch (error) {
    console.error('Error in registerHospital:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Login hospital
// @route   POST /api/hospital/auth/login
// @access  Public
exports.loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find hospital with password field
    const hospital = await Hospital.findOne({ email }).select('+password');
    
    console.log('Hospital found:', hospital ? 'Yes' : 'No');
    
    if (!hospital) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if hospital has password set (for backward compatibility)
    if (!hospital.password) {
      console.log('Hospital has no password set');
      return res.status(401).json({ 
        success: false, 
        message: 'Account not configured for login. Please contact admin.' 
      });
    }

    console.log('Checking password...');
    // Check password
    const isPasswordMatch = await hospital.comparePassword(password);
    
    console.log('Password match:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('Checking approval status:', hospital.isApproved);
    // Check if approved
    if (!hospital.isApproved) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval' 
      });
    }

    // Update last login
    hospital.lastLogin = new Date();
    await hospital.save();

    // Generate token
    const token = generateToken(hospital._id);

    console.log('Login successful for:', hospital.Hosp_Name || hospital.name);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: hospital._id,
        Hosp_Name: hospital.Hosp_Name,
        email: hospital.email,
        Hosp_Phone: hospital.Hosp_Phone,
        City_Id: hospital.City_Id,
        isApproved: hospital.isApproved,
        lastLogin: hospital.lastLogin,
        token
      }
    });
  } catch (error) {
    console.error('Error in loginHospital:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get current hospital profile
// @route   GET /api/hospital/auth/me
// @access  Private (Hospital)
exports.getHospitalProfile = async (req, res) => {
  try {
    console.log('Getting hospital profile for ID:', req.hospital._id);
    const hospital = await Hospital.findById(req.hospital._id).select('-password').lean();
    console.log('Hospital query completed');

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    console.log('Hospital found:', hospital.Hosp_Name || hospital.name);
    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('Error in getHospitalProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospital/auth/profile
// @access  Private (Hospital)
exports.updateHospitalProfile = async (req, res) => {
  try {
    const { Hosp_Name, Hosp_Phone, address } = req.body;

    const hospital = await Hospital.findById(req.hospital._id);

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    // Update fields
    if (Hosp_Name) {
      hospital.Hosp_Name = Hosp_Name;
      hospital.name = Hosp_Name;
    }
    if (Hosp_Phone) {
      hospital.Hosp_Phone = Hosp_Phone;
      hospital.phone = Hosp_Phone;
    }
    if (address) hospital.address = address;

    await hospital.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: hospital
    });
  } catch (error) {
    console.error('Error in updateHospitalProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Change hospital password
// @route   PUT /api/hospital/auth/change-password
// @access  Private (Hospital)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide current and new password' 
      });
    }

    const hospital = await Hospital.findById(req.hospital._id).select('+password');

    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hospital not found' 
      });
    }

    // Check current password
    const isMatch = await hospital.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    hospital.password = newPassword;
    await hospital.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
