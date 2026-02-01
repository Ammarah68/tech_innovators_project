/**
 * Tech Innovators Club Platform Server
 * Entry point for the application
 */

// External dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

// Internal modules
const connectDB = require('./config/db');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet()); // Sets security headers
app.use(xss()); // Sanitizes user input to prevent XSS attacks

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Tech Innovators Club Platform API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(globalErrorHandler);

// 404 handler for undefined routes
app.all('*', notFound);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;