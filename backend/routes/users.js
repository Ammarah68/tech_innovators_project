const express = require('express');
const { body, validationResult } = require('express-validator');
const { getUsers, getUser, updateUser, getUserProjects, getUserAchievements } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getUsers);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, getUser);

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('location')
    .optional()
    .trim(),
  body('education')
    .optional()
    .trim(),
  body('occupation')
    .optional()
    .trim(),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await updateUser(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @desc    Get user projects
// @route   GET /api/users/:id/projects
// @access  Private
router.get('/:id/projects', protect, getUserProjects);

// @desc    Get user achievements
// @route   GET /api/users/:id/achievements
// @access  Private
router.get('/:id/achievements', protect, getUserAchievements);

module.exports = router;