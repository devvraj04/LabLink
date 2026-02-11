/**
 * Middleware to check if user has the required role(s)
 * Must be used after isAuthenticated middleware
 * @param {Array} roles - Array of allowed roles
 */
const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden - This action requires ${roles.join(' or ')} role` 
      });
    }

    next();
  };
};

module.exports = isAuthorized;
