/**
 * Utility functions for user-related operations
 */

/**
 * Calculates user engagement metrics
 * @param {Object} user - User document
 * @param {Array} projects - Array of user's projects
 * @returns {Object} - Engagement metrics
 */
const calculateUserMetrics = (user, projects) => {
  const metrics = {
    totalProjects: projects.length,
    approvedProjects: 0,
    pendingProjects: 0,
    rejectedProjects: 0,
    totalProjectViews: 0,
    totalProjectLikes: 0,
    avgProjectEngagement: 0,
    joinDate: user.joinDate,
    daysSinceJoin: Math.floor((Date.now() - user.joinDate) / (1000 * 60 * 60 * 24))
  };
  
  projects.forEach(project => {
    metrics[`${project.status}Projects`]++;
    metrics.totalProjectViews += project.views;
    metrics.totalProjectLikes += project.likes.length;
  });
  
  if (projects.length > 0) {
    metrics.avgProjectEngagement = metrics.totalProjectViews / projects.length;
  }
  
  return metrics;
};

/**
 * Formats user profile data for API response
 * @param {Object} user - User document
 * @param {Object} metrics - User metrics object
 * @returns {Object} - Formatted user profile
 */
const formatUserProfile = (user, metrics = null) => {
  const profile = {
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
    lastLogin: user.lastLogin,
    avatar: user.avatar,
    isActive: user.isActive
  };
  
  if (metrics) {
    profile.metrics = metrics;
  }
  
  return profile;
};

/**
 * Generates user leaderboard based on various criteria
 * @param {Array} users - Array of user documents
 * @param {Array} projects - Array of project documents
 * @returns {Array} - Leaderboard array
 */
const generateLeaderboard = (users, projects) => {
  // Create a map of user IDs to their projects
  const userProjectsMap = {};
  users.forEach(user => {
    userProjectsMap[user._id.toString()] = [];
  });
  
  projects.forEach(project => {
    const ownerId = project.owner.toString();
    if (userProjectsMap[ownerId]) {
      userProjectsMap[ownerId].push(project);
    }
  });
  
  // Calculate scores for each user
  const leaderboard = users.map(user => {
    const userProjects = userProjectsMap[user._id.toString()] || [];
    
    // Calculate score based on projects, likes, views, etc.
    let score = 0;
    userProjects.forEach(project => {
      score += project.likes.length * 2; // 2 points per like
      score += Math.floor(project.views / 10); // 1 point per 10 views
      if (project.featured) score += 10; // 10 bonus points for featured projects
      if (project.status === 'approved') score += 5; // 5 points for approved projects
    });
    
    return {
      id: user._id,
      fullName: user.fullName,
      avatar: user.avatar,
      score,
      projectCount: userProjects.length,
      totalLikes: userProjects.reduce((sum, proj) => sum + proj.likes.length, 0),
      totalViews: userProjects.reduce((sum, proj) => sum + proj.views, 0)
    };
  });
  
  // Sort by score descending
  return leaderboard.sort((a, b) => b.score - a.score);
};

module.exports = {
  calculateUserMetrics,
  formatUserProfile,
  generateLeaderboard
};