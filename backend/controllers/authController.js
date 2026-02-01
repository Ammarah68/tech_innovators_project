const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../utils/emailUtils');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with user data and token
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError('User already exists with this email', 400));
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email asynchronously (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.fullName)
      .then(() => console.log(`Welcome email sent to ${user.email}`))
      .catch(err => console.error('Error sending welcome email:', err));

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(new ApiError(error.message || 'Server error during registration', 500));
  }
};

/**
 * Authenticate user and get token
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with user data and token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(new ApiError(error.message || 'Server error during login', 500));
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 * @param {Object} req - Express request object (with user attached by middleware)
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with user data
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req object by protect middleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        location: user.location,
        education: user.education,
        occupation: user.occupation,
        skills: user.skills,
        role: user.role,
        joinDate: user.joinDate,
        avatar: user.avatar
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(new ApiError(error.message || 'Server error getting user data', 500));
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};