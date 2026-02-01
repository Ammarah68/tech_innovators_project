const Project = require('../models/Project');
const User = require('../models/User');
const { sendProjectApprovalEmail, sendProjectRejectionEmail } = require('../utils/emailUtils');

// @desc    Get all pending projects
// @route   GET /api/admin/pending-projects
// @access  Private/Admin
exports.getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'pending' })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get pending projects error:', error);
    res.status(500).json({ message: 'Server error getting pending projects' });
  }
};

// @desc    Get all approved projects
// @route   GET /api/admin/approved-projects
// @access  Private/Admin
exports.getApprovedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'approved' })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get approved projects error:', error);
    res.status(500).json({ message: 'Server error getting approved projects' });
  }
};

// @desc    Get all rejected projects
// @route   GET /api/admin/rejected-projects
// @access  Private/Admin
exports.getRejectedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'rejected' })
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get rejected projects error:', error);
    res.status(500).json({ message: 'Server error getting rejected projects' });
  }
};

// @desc    Approve a project
// @route   PATCH /api/admin/projects/:id/approve
// @access  Private/Admin
exports.approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = 'approved';
    await project.save();

    // Send approval notification email
    if (project.owner) {
      sendProjectApprovalEmail(
        project.owner.email,
        project.owner.fullName,
        project.title
      )
      .then(() => console.log(`Approval email sent to ${project.owner.email}`))
      .catch(err => console.error('Error sending approval email:', err));
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({ message: 'Server error approving project' });
  }
};

// @desc    Reject a project
// @route   PATCH /api/admin/projects/:id/reject
// @access  Private/Admin
exports.rejectProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = 'rejected';
    await project.save();

    // Send rejection notification email
    if (project.owner) {
      sendProjectRejectionEmail(
        project.owner.email,
        project.owner.fullName,
        project.title,
        'Did not meet community guidelines'
      )
      .then(() => console.log(`Rejection email sent to ${project.owner.email}`))
      .catch(err => console.error('Error sending rejection email:', err));
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Reject project error:', error);
    res.status(500).json({ message: 'Server error rejecting project' });
  }
};