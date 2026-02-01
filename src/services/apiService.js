// apiService.js
// Service for handling API calls to the backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic request function
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

// Authentication API calls
export const authService = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () => request('/auth/me'),
};

// Project API calls
export const projectService = {
  getAllProjects: () => request('/projects'),

  getProjectById: (id) => request(`/projects/${id}`),

  createProject: (projectData) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  updateProject: (id, projectData) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  deleteProject: (id) => request(`/projects/${id}`, {
    method: 'DELETE',
  }),

  approveProject: (id) => request(`/admin/projects/${id}/approve`, {
    method: 'PATCH',
  }),

  rejectProject: (id) => request(`/admin/projects/${id}/reject`, {
    method: 'PATCH',
  }),

  getUserProjects: (userId) => request(`/users/${userId}/projects`),
};

// User API calls
export const userService = {
  getUserProfile: (id) => request(`/users/${id}`),

  updateUserProfile: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  getAllUsers: () => request('/users'),

  getUserAchievements: (id) => request(`/users/${id}/achievements`),
};

// Admin API calls
export const adminService = {
  getPendingProjects: () => request('/admin/pending-projects'),
  
  getApprovedProjects: () => request('/admin/approved-projects'),
  
  getRejectedProjects: () => request('/admin/rejected-projects'),
};