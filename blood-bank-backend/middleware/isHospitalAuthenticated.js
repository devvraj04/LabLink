const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');

/**
 * Middleware to authenticate hospital using JWT
 * Verifies the token and checks if it's a hospital role
 */
const isHospitalAuthenticated = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if role is hospital
    if (decoded.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Hospital account required'
      });
    }

    // Get hospital from database
    const hospital = await Hospital.findById(decoded.id).select('-password').lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Check if hospital is approved
    if (!hospital.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Account pending approval'
      });
    }

    // Attach hospital to request object
    req.hospital = hospital;
    next();
  } catch (error) {
    console.error('Hospital auth error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

module.exports = isHospitalAuthenticated;

