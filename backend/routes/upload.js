const express = require('express');
const { protect } = require('../middleware/auth');
const { configureUpload } = require('../utils/fileUploadUtils');

const router = express.Router();

// Configure multer upload
const upload = configureUpload();

// @desc    Upload project files (images, documents, etc.)
// @route   POST /api/projects/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Process the uploaded file
    const fileMetadata = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date(),
      uploaderId: req.user.id
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileMetadata
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during file upload' 
    });
  }
});

module.exports = router;