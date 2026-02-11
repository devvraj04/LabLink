const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const User = require('../models/User');

/**
 * Middleware to authenticate both admin and hospital users
 * Allows either admin or hospital to access the route
 */
const isAdminOrHospital = async (req, res, next) => {
  console.log('🔐 Admin or Hospital Authentication Middleware Hit');
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Token present:', !!token);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded - ID:', decoded.id, 'Role:', decoded.role);

    // Check if token has role field (hospital tokens have this)
    if (decoded.role === 'hospital') {
      // Get hospital from database
      console.log('Middleware: Looking for hospital with ID:', decoded.id);
      const hospital = await Hospital.findById(decoded.id).select('-password').lean();
      console.log('Middleware: Hospital found:', hospital ? 'Yes' : 'No');

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
          message: 'Hospital account not approved yet' 
        });
      }

      // Attach hospital to request
      req.hospital = hospital;
      req.userRole = 'hospital';
      console.log('Middleware: Hospital attached to request');
      
    } else {
      // Token doesn't have role field (admin/staff tokens)
      // Try to find user in User collection
      console.log('Middleware: Looking for admin/user with ID:', decoded.id);
      const user = await User.findById(decoded.id).select('-password').lean();
      
      if (user) {
        console.log('Middleware: User found with role:', user.role);
        
        // Check if user has appropriate role (admin, manager, bb_manager, or recording_staff)
        if (user.role === 'admin' || user.role === 'manager' || user.role === 'bb_manager' || user.role === 'recording_staff') {
          // Attach user to request
          req.user = user;
          req.userRole = user.role;
          console.log('Middleware: User attached to request');
        } else {
          return res.status(403).json({ 
            success: false, 
            message: 'Access denied - Admin or Hospital account required' 
          });
        }
      } else {
        // Not found in User collection, might be invalid token
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
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
      message: 'Authentication error',
      error: error.message 
    });
  }
};

module.exports = isAdminOrHospital;
