// Database configuration for Tech Innovators Club Platform
const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tech_innovators_club',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  // Additional options for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20 // Maximum number of clients in the pool
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
  }
});

// Database utility functions
const db = {
  // Execute a query with parameters
  query: (text, params) => {
    console.log('Executing query:', text);
    return pool.query(text, params);
  },

  // Get user by ID
  getUserById: async (id) => {
    const result = await pool.query('SELECT id, name, email, role, bio, avatar_url, location, education, occupation, join_date, is_active FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const result = await pool.query('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Create a new user
  createUser: async (name, email, password_hash, role = 'member') => {
    const result = await pool.query(
      'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role, join_date',
      [name, email, password_hash, role]
    );
    return result.rows[0];
  },

  // Get all projects with pagination
  getProjects: async (limit = 10, offset = 0, status = 'approved') => {
    const result = await pool.query(
      'SELECT p.id, p.title, p.description, p.user_id, u.name as owner_name, p.status, p.created_at, p.views_count, p.likes_count FROM projects p JOIN users u ON p.user_id = u.id WHERE p.status = $1 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );
    return result.rows;
  },

  // Get project by ID
  getProjectById: async (id) => {
    // Increment view count
    await pool.query('UPDATE projects SET views_count = views_count + 1 WHERE id = $1', [id]);
    
    const result = await pool.query(`
      SELECT p.*, u.name as owner_name, u.avatar_url as owner_avatar, 
             STRING_AGG(t.name, ', ') as tags
      FROM projects p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN project_tags pt ON p.id = pt.project_id 
      LEFT JOIN tags t ON pt.tag_id = t.id 
      WHERE p.id = $1 
      GROUP BY p.id, u.name, u.avatar_url`,
      [id]
    );
    return result.rows[0];
  },

  // Create a new project
  createProject: async (title, description, user_id, category_id, github_url, demo_url, technologies_used) => {
    const result = await pool.query(
      'INSERT INTO projects(title, description, user_id, category_id, github_url, demo_url, technologies_used) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, description, user_id, created_at',
      [title, description, user_id, category_id, github_url, demo_url, technologies_used]
    );
    return result.rows[0];
  },

  // Get comments for a project
  getCommentsForProject: async (project_id, limit = 10, offset = 0) => {
    const result = await pool.query(`
      SELECT c.*, u.name as author_name, u.avatar_url as author_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = $1 AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3`,
      [project_id, limit, offset]
    );
    return result.rows;
  },

  // Add a comment to a project
  addComment: async (project_id, user_id, content, parent_comment_id = null) => {
    const result = await pool.query(
      'INSERT INTO comments(project_id, user_id, content, parent_comment_id) VALUES($1, $2, $3, $4) RETURNING id, project_id, user_id, content, created_at',
      [project_id, user_id, content, parent_comment_id]
    );
    return result.rows[0];
  },

  // Get user projects
  getUserProjects: async (user_id) => {
    const result = await pool.query(
      'SELECT p.id, p.title, p.description, p.status, p.created_at, p.views_count, p.likes_count FROM projects p WHERE p.user_id = $1 ORDER BY p.created_at DESC',
      [user_id]
    );
    return result.rows;
  },

  // Update project status (for admin use)
  updateProjectStatus: async (project_id, status, admin_user_id, reason = null) => {
    // Update project status
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', [status, project_id]);
    
    // Log admin action
    await pool.query(
      'INSERT INTO admin_actions(admin_user_id, action_type, target_table, target_id, reason) VALUES($1, $2, $3, $4, $5)',
      [admin_user_id, `project_${status}`, 'projects', project_id, reason]
    );
    
    return { project_id, status };
  }
};

module.exports = db;