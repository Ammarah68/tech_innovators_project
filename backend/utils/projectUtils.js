/**
 * Utility functions for the Tech Innovators Club Platform
 */

/**
 * Builds a MongoDB query object based on provided filters
 * @param {Object} filters - Filters to apply to the query
 * @returns {Object} - MongoDB query object
 */
const buildProjectQuery = (filters = {}) => {
  const query = { status: 'approved' }; // Only approved projects for public

  // Add category filter if provided
  if (filters.category) {
    query.category = filters.category;
  }

  // Add search filter if provided
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Add tag filter if provided
  if (filters.tag) {
    query.tags = { $in: Array.isArray(filters.tag) ? filters.tag : [filters.tag] };
  }

  // Add technology filter if provided
  if (filters.technology) {
    query.technologies = { $regex: filters.technology, $options: 'i' };
  }

  // Add date range filter if provided
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return query;
};

/**
 * Formats project data for API response
 * @param {Object} project - Project document from database
 * @param {Boolean} includeOwner - Whether to include owner details
 * @returns {Object} - Formatted project data
 */
const formatProjectResponse = (project, includeOwner = true) => {
  if (!project) return null;

  const formattedProject = {
    id: project._id || project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    tags: Array.isArray(project.tags) ? project.tags : [],
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers : [],
    technologies: project.technologies,
    challenges: project.challenges,
    achievements: project.achievements,
    status: project.status,
    likes: Array.isArray(project.likes) ? project.likes.length : (typeof project.likes === 'number' ? project.likes : 0),
    views: typeof project.views === 'number' ? project.views : 0,
    featured: !!project.featured,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };

  if (includeOwner && project.owner) {
    formattedProject.owner = {
      id: project.owner._id || project.owner.id,
      fullName: project.owner.fullName,
      email: project.owner.email,
      avatar: project.owner.avatar
    };
  }

  if (project.collaborators && Array.isArray(project.collaborators) && project.collaborators.length > 0) {
    formattedProject.collaborators = project.collaborators.map(collab => ({
      id: collab._id || collab.id,
      fullName: collab.fullName,
      email: collab.email,
      avatar: collab.avatar
    }));
  }

  return formattedProject;
};

/**
 * Calculates project engagement score based on various factors
 * @param {Object} project - Project object with likes, views, featured, and createdAt properties
 * @returns {Number} - Engagement score (0-100)
 */
const calculateEngagementScore = (project) => {
  // Validate input
  if (!project) return 0;

  // Base score calculation
  let score = 0;

  // Likes contribute to score (each like adds 2 points, max 40)
  const likes = Array.isArray(project.likes) ? project.likes.length : (typeof project.likes === 'number' ? project.likes : 0);
  score += Math.min(likes * 2, 40);

  // Views contribute to score (each 10 views add 1 point, max 20)
  const views = typeof project.views === 'number' ? project.views : 0;
  score += Math.min(Math.floor(views / 10), 20);

  // Featured projects get bonus (20 points)
  if (project.featured) {
    score += 20;
  }

  // Recency bonus (up to 20 points for recent projects)
  const createdAt = new Date(project.createdAt);
  if (!isNaN(createdAt.getTime())) {
    const daysSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 20 - (daysSinceCreation / 7)); // Decreases over time
    score += recencyBonus;
  }

  // Cap the score at 100
  return Math.min(score, 100);
};

/**
 * Generates project statistics
 * @param {Array} projects - Array of project documents
 * @returns {Object} - Statistics object
 */
const generateProjectStats = (projects) => {
  if (!Array.isArray(projects) || projects.length === 0) {
    return {
      total: 0,
      byCategory: {},
      byStatus: {},
      totalViews: 0,
      totalLikes: 0,
      averageEngagement: 0
    };
  }

  const stats = {
    total: projects.length,
    byCategory: {},
    byStatus: {},
    totalViews: 0,
    totalLikes: 0,
    averageEngagement: 0
  };

  projects.forEach(project => {
    // Count by category
    const category = project.category || 'Uncategorized';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Count by status
    const status = project.status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Sum views and likes
    stats.totalViews += typeof project.views === 'number' ? project.views : 0;
    const likes = Array.isArray(project.likes) ? project.likes.length : (typeof project.likes === 'number' ? project.likes : 0);
    stats.totalLikes += likes;
  });

  // Calculate average engagement
  if (projects.length > 0) {
    stats.averageEngagement = stats.totalViews / projects.length;
  }

  return stats;
};

module.exports = {
  buildProjectQuery,
  formatProjectResponse,
  calculateEngagementScore,
  generateProjectStats
};