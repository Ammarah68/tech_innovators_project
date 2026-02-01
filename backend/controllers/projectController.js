const Project = require('../models/Project');
const User = require('../models/User');
const { buildProjectQuery, formatProjectResponse, calculateEngagementScore } = require('../utils/projectUtils');
const { processUploadedFile } = require('../utils/fileUploadUtils');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all projects with filtering and pagination
 * @route GET /api/projects
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with projects and pagination info
 */
const getProjects = async (req, res, next) => {
  try {
    // Extract query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query object using utility function
    const query = buildProjectQuery({
      category: req.query.category,
      search: req.query.search,
      tag: req.query.tag,
      technology: req.query.technology,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });

    // Use aggregation for better performance when dealing with large datasets
    const projects = await Project.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerInfo'
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$ownerInfo', 0] }
        }
      },
      {
        $project: {
          'owner.fullName': 1,
          'owner.email': 1,
          'owner.avatar': 1,
          title: 1,
          description: 1,
          category: 1,
          tags: 1,
          githubUrl: 1,
          demoUrl: 1,
          teamMembers: 1,
          technologies: 1,
          challenges: 1,
          achievements: 1,
          status: 1,
          likes: { $size: '$likes' }, // Count likes instead of returning full array
          views: 1,
          featured: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      count: projects.length,
      page,
      totalPages: Math.ceil(total / limit),
      data: projects
    });
  } catch (error) {
    next(new ApiError(error.message || 'Server error getting projects', 500));
  }
};

/**
 * Get single project by ID
 * @route GET /api/projects/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with project data and related projects
 */
const getProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Use aggregation for better performance
    const project = await Project.aggregate([
      { $match: { _id: require('mongoose').Types.ObjectId(projectId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerInfo'
        }
      },
      {
        $addFields: {
          owner: { $arrayElemAt: ['$ownerInfo', 0] }
        }
      },
      {
        $project: {
          'owner.fullName': 1,
          'owner.email': 1,
          'owner.avatar': 1,
          title: 1,
          description: 1,
          category: 1,
          tags: 1,
          githubUrl: 1,
          demoUrl: 1,
          teamMembers: 1,
          technologies: 1,
          challenges: 1,
          achievements: 1,
          status: 1,
          likes: { $size: '$likes' }, // Count likes instead of returning full array
          views: 1,
          featured: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]).then(results => results[0]);

    if (!project) {
      return next(new ApiError('Project not found', 404));
    }

    // Increment view count using findOneAndUpdate for atomic operation
    await Project.findByIdAndUpdate(
      projectId,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    // Calculate engagement score
    const engagementScore = calculateEngagementScore({
      likes: project.likes,
      views: project.views,
      featured: project.featured,
      createdAt: project.createdAt
    });

    // Get related projects
    const relatedProjects = await Project.getRelatedProjects(
      projectId,
      project.category,
      3
    );

    res.json({
      success: true,
      data: {
        ...project,
        engagementScore
      },
      related: relatedProjects
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ApiError('Invalid project ID', 400));
    }
    next(new ApiError(error.message || 'Server error getting project', 500));
  }
};

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with created project
 */
const createProject = async (req, res, next) => {
  try {
    // Add owner to the request body
    req.body.owner = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(new ApiError(error.message || 'Server error creating project', 500));
  }
};

/**
 * Update a project
 * @route PUT /api/projects/:id
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with updated project
 */
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError('Project not found', 404));
    }

    // Check if user owns the project or is an admin
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return next(new ApiError('Not authorized to update this project', 403));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ApiError('Invalid project ID', 400));
    }
    next(new ApiError(error.message || 'Server error updating project', 500));
  }
};

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with deletion confirmation
 */
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError('Project not found', 404));
    }

    // Check if user owns the project or is an admin
    if (project.owner.toString() !== userId && userRole !== 'admin') {
      return next(new ApiError('Not authorized to delete this project', 403));
    }

    await Project.findByIdAndDelete(projectId);

    res.json({
      success: true,
      message: 'Project removed'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ApiError('Invalid project ID', 400));
    }
    next(new ApiError(error.message || 'Server error deleting project', 500));
  }
};

/**
 * Like or unlike a project
 * @route PATCH /api/projects/:id/like
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with updated project
 */
const likeProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Use findOneAndUpdate for atomic operation
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ApiError('Project not found', 404));
    }

    // Check if user already liked the project
    const isLiked = project.likes.some(like => like.toString() === userId);

    if (isLiked) {
      // Unlike the project
      project.likes.pull(userId);
    } else {
      // Like the project
      project.likes.push(userId);
    }

    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ApiError('Invalid project ID', 400));
    }
    next(new ApiError(error.message || 'Server error liking project', 500));
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  likeProject
};