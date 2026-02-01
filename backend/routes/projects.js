const express = require('express');
const { body, validationResult } = require('express-validator');
const { getProjects, getProject, createProject, updateProject, deleteProject, likeProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', getProjects);

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', getProject);

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('technologies')
    .trim()
    .notEmpty()
    .withMessage('Technologies used are required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await createProject(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Category is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await updateProject(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', protect, deleteProject);

// @desc    Like/unlike a project
// @route   PATCH /api/projects/:id/like
// @access  Private
router.patch('/:id/like', protect, likeProject);

module.exports = router;