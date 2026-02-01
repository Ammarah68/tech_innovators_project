const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

describe('Tech Innovators Club Platform API Tests - Refactored', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-innovators-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany();
    await Project.deleteMany();
  });

  describe('Authentication Tests', () => {
    it('should register a new user', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password12345' // Updated to meet new validation requirements (8 chars min)
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
    });

    it('should not register a user with invalid email', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'invalid-email',
        password: 'password12345'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should login an existing user', async () => {
      // First register a user
      const hashedPassword = await bcrypt.hash('password12345', 12);
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password12345'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      // First register a user
      const hashedPassword = await bcrypt.hash('password12345', 12);
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('Project Tests', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create a user and get auth token
      const hashedPassword = await bcrypt.hash('password12345', 12);
      const user = await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });
      
      userId = user._id;

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password12345' });

      authToken = loginRes.body.token;
    });

    it('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description with at least fifty characters to meet the validation requirement.',
        category: 'Web Development',
        technologies: 'React, Node.js, MongoDB',
        tags: ['React', 'JavaScript']
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(projectData.title);
      expect(res.body.data.owner.toString()).toBe(userId.toString());
    });

    it('should not create a project with invalid data', async () => {
      const projectData = {
        title: 'Te', // Too short
        description: 'Short desc', // Too short
        category: 'Web Development',
        technologies: 'React, Node.js, MongoDB'
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should get all projects', async () => {
      // Create a project first
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description with at least fifty characters to meet the validation requirement.',
        category: 'Web Development',
        technologies: 'React, Node.js, MongoDB',
        status: 'approved' // Only approved projects are public
      };

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);

      const res = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('User Profile Tests', () => {
    let authToken;

    beforeEach(async () => {
      // Create a user and get auth token
      const hashedPassword = await bcrypt.hash('password12345', 12);
      await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      });

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password12345' });

      authToken = loginRes.body.token;
    });

    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should update user profile', async () => {
      const updateData = {
        bio: 'Updated bio',
        location: 'New York, NY',
        skills: ['JavaScript', 'React', 'Node.js']
      };

      const userRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      const userId = userRes.body.user.id;

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBe(updateData.bio);
      expect(res.body.data.location).toBe(updateData.location);
    });
  });

  describe('Admin Tests', () => {
    let adminAuthToken;
    let regularUserToken;

    beforeEach(async () => {
      // Create admin user
      const adminHashedPassword = await bcrypt.hash('password12345', 12);
      await User.create({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: adminHashedPassword,
        role: 'admin'
      });

      // Create regular user
      const userHashedPassword = await bcrypt.hash('password12345', 12);
      await User.create({
        fullName: 'Regular User',
        email: 'user@example.com',
        password: userHashedPassword
      });

      // Login as admin
      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'password12345' });

      adminAuthToken = adminLoginRes.body.token;

      // Login as regular user
      const userLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'password12345' });

      regularUserToken = userLoginRes.body.token;
    });

    it('should get pending projects for admin', async () => {
      // Create a pending project
      const hashedPassword = await bcrypt.hash('password12345', 12);
      const user = await User.create({
        fullName: 'Project Owner',
        email: 'owner@example.com',
        password: hashedPassword
      });

      await Project.create({
        title: 'Pending Project',
        description: 'This is a pending project description with at least fifty characters to meet the validation requirement.',
        category: 'Web Development',
        technologies: 'React, Node.js, MongoDB',
        owner: user._id,
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/admin/pending-projects')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow regular user to access admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/pending-projects')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 for non-existent route', async () => {
      const res = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should handle invalid project ID', async () => {
      const res = await request(app)
        .get('/api/projects/invalid-id')
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });
});