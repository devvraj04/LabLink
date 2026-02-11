const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  // SQL Schema fields (Primary)
  Reci_Id: {
    type: Number,
    sparse: true,
  },
  Reci_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  Reci_Age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  Reci_Sex: {
    type: String,
    enum: ['M', 'F', 'Male', 'Female', 'Other'],
    maxlength: 10
  },
  Reci_Phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  Reci_Bgrp: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    maxlength: 3
  },
  Reci_Bqty: {
    type: Number,
    min: [1, 'Blood quantity must be at least 1 unit']
  },
  Reci_Date: {
    type: Date,
    default: Date.now
  },
  City_Id: {
    type: mongoose.Schema.Types.Mixed,  // Accept both Number and ObjectId for backward compatibility
    ref: 'City'
  },

  // Old fields for backward compatibility
  name: {
    type: String,
    trim: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  bloodQuantity: {
    type: Number,
    min: [1, 'Blood quantity must be at least 1 unit'],
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  phone: {
    type: String,
    trim: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Pre-save hook to sync fields
recipientSchema.pre('save', function (next) {
  // Sync new to old
  if (this.Reci_Name) this.name = this.Reci_Name;
  if (this.Reci_Bgrp) this.bloodGroup = this.Reci_Bgrp;
  if (this.Reci_Bqty) this.bloodQuantity = this.Reci_Bqty;
  if (this.Reci_Age) this.age = this.Reci_Age;
  if (this.Reci_Sex) {
    this.sex = this.Reci_Sex === 'M' ? 'Male' : (this.Reci_Sex === 'F' ? 'Female' : this.Reci_Sex);
  }
  if (this.Reci_Phone) this.phone = this.Reci_Phone;
  if (this.Reci_Date) this.requestDate = this.Reci_Date;

  // Sync old to new
  if (this.name && !this.Reci_Name) this.Reci_Name = this.name;
  if (this.bloodGroup && !this.Reci_Bgrp) this.Reci_Bgrp = this.bloodGroup;
  if (this.bloodQuantity && !this.Reci_Bqty) this.Reci_Bqty = this.bloodQuantity;
  if (this.age && !this.Reci_Age) this.Reci_Age = this.age;
  if (this.sex && !this.Reci_Sex) {
    this.Reci_Sex = this.sex === 'Male' ? 'M' : (this.sex === 'Female' ? 'F' : this.sex);
  }
  if (this.phone && !this.Reci_Phone) this.Reci_Phone = this.phone;
  if (this.requestDate && !this.Reci_Date) this.Reci_Date = this.requestDate;

  next();
});

// Index for faster queries
recipientSchema.index({ Reci_Bgrp: 1 });
recipientSchema.index({ bloodGroup: 1 });
recipientSchema.index({ City_Id: 1 });
recipientSchema.index({ status: 1 });

module.exports = mongoose.model('Recipient', recipientSchema);
