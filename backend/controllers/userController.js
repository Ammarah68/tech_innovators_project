const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Project = require('../models/Project');
const { calculateUserMetrics, formatUserProfile, generateLeaderboard } = require('../utils/userUtils');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Get all users (excluding password)
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Get all projects to calculate leaderboard
    const projects = await Project.find({});

    // Generate leaderboard
    const leaderboard = generateLeaderboard(users, projects);

    res.json({
      success: true,
      count: users.length,
      data: users.map(user => formatUserProfile(user)),
      leaderboard
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error getting users' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's projects to calculate metrics
    const projects = await Project.find({ owner: user._id });
    const metrics = calculateUserMetrics(user, projects);

    res.json({
      success: true,
      data: formatUserProfile(user, metrics)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is updating their own profile or is an admin
    if (req.user.id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// @desc    Get user projects
// @route   GET /api/users/:id/projects
// @access  Private
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.id })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ message: 'Server error getting user projects' });
  }
};

// @desc    Get user achievements
// @route   GET /api/users/:id/achievements
// @access  Private
exports.getUserAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.params.id })
      .sort({ dateAwarded: -1 });

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Server error getting user achievements' });
  }
};