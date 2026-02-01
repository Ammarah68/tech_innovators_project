const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');

/**
 * Protect routes with JWT authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 * @returns {void}
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new ApiError('User not found', 401));
      }

      // Check if user is active
      if (!req.user.isActive) {
        return next(new ApiError('Account is deactivated', 401));
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError('Invalid token', 401));
      } else if (error.name === 'TokenExpiredError') {
        return next(new ApiError('Token expired', 401));
      }
      return next(new ApiError('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new ApiError('Not authorized, no token', 401));
  }
};

/**
 * Grant access to specific roles
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {Function} - Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(`User role '${req.user?.role || 'undefined'}' is not authorized to access this route`, 403));
    }
    next();
  };
};

module.exports = { protect, authorize };