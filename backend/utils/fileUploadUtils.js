/**
 * File upload utility functions for the Tech Innovators Club Platform
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configure multer for file uploads
 */
const configureUpload = () => {
  // Define storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  // File filter to allow certain file types
  const fileFilter = (req, file, cb) => {
    // Allowed file extensions
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and zip files are allowed.'));
    }
  };

  // Create multer instance
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
  });

  return upload;
};

/**
 * Validate uploaded file
 * @param {Object} file - Uploaded file object
 * @returns {Object} - Validation result
 */
const validateFile = (file) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('No file uploaded');
    return result;
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    result.isValid = false;
    result.errors.push('File size exceeds 10MB limit');
  }

  // Check file extension
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    result.isValid = false;
    result.errors.push('Invalid file type. Only images, documents, and zip files are allowed.');
  }

  return result;
};

/**
 * Process uploaded file and return metadata
 * @param {Object} file - Uploaded file object
 * @returns {Object} - File metadata
 */
const processUploadedFile = (file) => {
  if (!file) return null;

  return {
    originalName: file.originalname,
    fileName: file.filename,
    path: file.path,
    size: file.size,
    mimeType: file.mimetype,
    uploadDate: new Date()
  };
};

/**
 * Clean up uploaded files after a certain period
 * @param {Number} days - Number of days after which files should be deleted
 */
const cleanupOldFiles = (days = 30) => {
  const uploadDir = 'uploads/';
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('Error reading upload directory:', err);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error('Error getting file stats:', err);
            return;
          }

          if (stats.birthtime < cutoffDate) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting old file:', err);
              } else {
                console.log(`Deleted old file: ${filePath}`);
              }
            });
          }
        });
      });
    });
  }
};

module.exports = {
  configureUpload,
  validateFile,
  processUploadedFile,
  cleanupOldFiles
};