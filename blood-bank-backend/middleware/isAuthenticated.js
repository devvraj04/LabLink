const passport = require('passport');

/**
 * Middleware to authenticate user using JWT
 * Verifies the token from Authorization header
 */
const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error',
        error: err.message 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Invalid or missing token' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = isAuthenticated;
