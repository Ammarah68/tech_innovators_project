const mongoose = require('mongoose');
const validator = require('validator');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    minlength: [5, 'Title must be at least 5 characters'],
    index: true, // Add index for faster queries
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: [
        'Web Development',
        'Mobile App',
        'Machine Learning',
        'Blockchain',
        'Cybersecurity',
        'IoT',
        'Game Development',
        'Data Science',
        'DevOps',
        'Other'
      ],
      message: 'Category must be one of the predefined values',
    },
    index: true, // Add index for faster queries
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters'],
    lowercase: true,
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: (value) => !value || validator.isURL(value),
      message: 'Please provide a valid GitHub URL',
    },
  },
  demoUrl: {
    type: String,
    validate: {
      validator: (value) => !value || validator.isURL(value),
      message: 'Please provide a valid URL',
    },
  },
  teamMembers: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each team member name cannot exceed 50 characters'],
  }],
  technologies: {
    type: String,
    required: [true, 'Please list the technologies used'],
    trim: true,
    maxlength: [500, 'Technologies field cannot exceed 500 characters'],
  },
  challenges: {
    type: String,
    maxlength: [1000, 'Challenges description cannot exceed 1000 characters'],
  },
  achievements: {
    type: String,
    maxlength: [1000, 'Achievements description cannot exceed 1000 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Add index for faster queries
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be either pending, approved, or rejected',
    },
    default: 'pending',
    index: true, // Add index for faster queries
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative'],
  },
  featured: {
    type: Boolean,
    default: false,
    index: true, // Add index for faster queries
  },
  isPublic: {
    type: Boolean,
    default: true, // Allow owners to make projects private
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }, // Include virtuals when converting to object
});

// Virtual for like count
projectSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Indexes for efficient searching and querying
projectSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search index
projectSchema.index({ category: 1, status: 1 }); // Compound index for category and status
projectSchema.index({ owner: 1 }); // Index for owner queries
projectSchema.index({ status: 1, createdAt: -1 }); // Index for status and date sorting
projectSchema.index({ featured: 1, createdAt: -1 }); // Index for featured projects
projectSchema.index({ views: -1 }); // Index for popular projects
projectSchema.index({ createdAt: -1 }); // Index for newest projects

// Static method to get related projects with better performance
projectSchema.statics.getRelatedProjects = async function (projectId, category, limit = 3) {
  try {
    // Use aggregation for better performance
    const relatedProjects = await this.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(projectId) },
          category: category,
          status: 'approved',
        },
      },
      {
        $lookup: {
          from: 'users', // Collection name for User model
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerInfo',
        },
      },
      {
        $addFields: {
          owner: {
            $arrayElemAt: ['$ownerInfo', 0],
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          createdAt: 1,
          likes: { $size: '$likes' }, // Count likes instead of returning full array
          views: 1,
          'owner.fullName': 1,
          'owner.email': 1,
          'owner.avatar': 1,
        },
      },
      { $limit: limit },
    ]);

    return relatedProjects;
  } catch (error) {
    console.error('Error getting related projects:', error);
    return [];
  }
};

// Pre-find middleware to populate owner by default
projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'fullName email avatar',
  });
  next();
});

module.exports = mongoose.model('Project', projectSchema);