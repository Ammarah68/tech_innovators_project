const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
    minlength: [2, 'Name must be at least 2 characters'],
    index: true, // Add index for faster queries
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true, // Add index for faster queries
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    select: false, // Don't include password in queries by default
  },
  avatar: {
    type: String, // Cloudinary URL
    default: '',
    validate: {
      validator: (value) => !value || validator.isURL(value),
      message: 'Please provide a valid URL for avatar',
    },
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters'],
  },
  education: {
    type: String,
    trim: true,
    maxlength: [200, 'Education field cannot exceed 200 characters'],
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters'],
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters'],
  }],
  role: {
    type: String,
    enum: {
      values: ['member', 'moderator', 'admin'],
      message: 'Role must be either member, moderator, or admin',
    },
    default: 'member',
    index: true, // Add index for faster queries
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true, // Add index for faster queries
  },
  joinDate: {
    type: Date,
    default: Date.now,
    immutable: true, // Cannot be changed after creation
  },
  lastLogin: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpire: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }, // Include virtuals when converting to object
});

// Virtual for full name split
userSchema.virtual('firstName').get(function () {
  return this.fullName ? this.fullName.split(' ')[0] : '';
});

userSchema.virtual('lastName').get(function () {
  const nameParts = this.fullName ? this.fullName.split(' ') : [];
  return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user statistics
userSchema.methods.getStats = async function () {
  const Project = require('./Project');

  const stats = await Project.aggregate([
    { $match: { owner: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statsObj = { total: 0, approved: 0, pending: 0, rejected: 0 };

  stats.forEach((stat) => {
    statsObj[stat._id] = stat.count;
    statsObj.total += stat.count;
  });

  return statsObj;
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ joinDate: -1 });
userSchema.index({ fullName: 'text', bio: 'text' }); // Text index for search

module.exports = mongoose.model('User', userSchema);