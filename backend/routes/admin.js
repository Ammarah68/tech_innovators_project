const express = require('express');
const { getPendingProjects, getApprovedProjects, getRejectedProjects, approveProject, rejectProject } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all pending projects
// @route   GET /api/admin/pending-projects
// @access  Private/Admin
router.get('/pending-projects', protect, authorize('admin'), getPendingProjects);

// @desc    Get all approved projects
// @route   GET /api/admin/approved-projects
// @access  Private/Admin
router.get('/approved-projects', protect, authorize('admin'), getApprovedProjects);

// @desc    Get all rejected projects
// @route   GET /api/admin/rejected-projects
// @access  Private/Admin
router.get('/rejected-projects', protect, authorize('admin'), getRejectedProjects);

// @desc    Approve a project
// @route   PATCH /api/admin/projects/:id/approve
// @access  Private/Admin
router.patch('/projects/:id/approve', protect, authorize('admin'), approveProject);

// @desc    Reject a project
// @route   PATCH /api/admin/projects/:id/reject
// @access  Private/Admin
router.patch('/projects/:id/reject', protect, authorize('admin'), rejectProject);

module.exports = router;