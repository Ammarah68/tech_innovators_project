const mongoose = require('mongoose');
const validator = require('validator');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true, // Add index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Please provide an achievement title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true, // Add index for faster queries
  },
  description: {
    type: String,
    required: [true, 'Please provide an achievement description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  dateAwarded: {
    type: Date,
    default: Date.now,
    index: true, // Add index for faster queries
  },
  badge: {
    type: String, // URL to badge image
    default: '',
    validate: {
      validator: (value) => !value || validator.isURL(value),
      message: 'Please provide a valid URL for the badge',
    },
  },
  category: {
    type: String,
    enum: {
      values: [
        'participation',
        'excellence',
        'innovation',
        'leadership',
        'community',
        'milestone'
      ],
      message: 'Category must be one of the predefined values',
    },
    default: 'participation',
    index: true, // Add index for faster queries
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative'],
    max: [1000, 'Points cannot exceed 1000'],
  },
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Who awarded this achievement
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
achievementSchema.index({ userId: 1, dateAwarded: -1 }); // For user achievements timeline
achievementSchema.index({ category: 1, points: -1 }); // For category leaderboards
achievementSchema.index({ dateAwarded: -1 }); // For recent achievements

module.exports = mongoose.model('Achievement', achievementSchema);