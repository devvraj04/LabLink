const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  // SQL Schema fields (Primary)
  Hosp_Id: {
    type: Number,
    sparse: true,
  },
  Hosp_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  Hosp_Phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  Hosp_Needed_Bgrp: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Multiple'],
    maxlength: 10
  },
  City_Id: {
    type: mongoose.Schema.Types.Mixed,  // Accept both Number and ObjectId for backward compatibility
    ref: 'City'
  },

  // Old fields for backward compatibility
  name: {
    type: String,
    trim: true,
    sparse: true, // Allow non-unique values
  },
  city: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allow multiple null values but unique non-null
  },
  // NEW: Authentication fields for hospital login
  password: {
    type: String,
    minlength: 6,
    select: false // Don't return password by default
  },
  isApproved: {
    type: Boolean,
    default: false // Admin must approve new hospitals
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  type: {
    type: String,
    enum: ['general', 'specialized', 'emergency'],
    default: 'general',
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative'],
  },
}, {
  timestamps: true,
});

// Pre-save hook to sync fields
hospitalSchema.pre('save', function (next) {
  // Sync new to old
  if (this.Hosp_Name) this.name = this.Hosp_Name;
  if (this.Hosp_Phone) this.phone = this.Hosp_Phone;

  // Sync old to new
  if (this.name && !this.Hosp_Name) this.Hosp_Name = this.name;
  if (this.phone && !this.Hosp_Phone) this.Hosp_Phone = this.phone;

  next();
});

// Hash password before saving
hospitalSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
hospitalSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
hospitalSchema.index({ Hosp_Needed_Bgrp: 1 });
hospitalSchema.index({ City_Id: 1 });
hospitalSchema.index({ city: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
