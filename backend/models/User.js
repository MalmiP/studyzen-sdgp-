// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Use undefined as default so the field isn’t created if not provided
  username: {
    type: String,
    default: undefined
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true, // Email remains unique
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  studentId: {
    type: String,
    required: [true, 'Please provide your student ID'],
    unique: true, // Keep this if you want student IDs to be unique
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  autoIndex: false  // Disable automatic index creation
});

// Pre-save hook to hash password and remove empty username
UserSchema.pre('save', async function(next) {
  // If username is an empty string, remove it from the document
  if (this.username === "") {
    this.username = undefined;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);