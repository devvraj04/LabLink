const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  // SQL Schema fields (Primary)
  Bd_Id: {
    type: Number,
    sparse: true, // Allow null for migration
  },
  Bd_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  Bd_Age: {
    type: Number,
    min: [18, 'Donor must be at least 18 years old'],
    max: [65, 'Donor must be at most 65 years old']
  },
  Bd_Sex: {
    type: String,
    enum: ['M', 'F', 'Male', 'Female', 'Other'], // Accept both formats
    maxlength: 10
  },
  Bd_Phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  Bd_Bgroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    maxlength: 3
  },
  Bd_reg_Date: {
    type: Date,
    default: Date.now
  },
  City_Id: {
    type: mongoose.Schema.Types.Mixed,  // Accept both Number and ObjectId for backward compatibility
    ref: 'City'
  },

  // Old fields for backward compatibility (will be removed later)
  name: {
    type: String,
    trim: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  age: {
    type: Number,
    min: [18, 'Donor must be at least 18 years old'],
    max: [65, 'Donor must be at most 65 years old'],
  },
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  phone: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Virtual to get name from either field
donorSchema.virtual('donorName').get(function () {
  return this.Bd_Name || this.name;
});

// Pre-save hook to sync old and new fields
donorSchema.pre('save', function (next) {
  // If new fields are set, sync to old fields
  if (this.Bd_Name) this.name = this.Bd_Name;
  if (this.Bd_Bgroup) this.bloodGroup = this.Bd_Bgroup;
  if (this.Bd_Age) this.age = this.Bd_Age;
  if (this.Bd_Sex) {
    this.sex = this.Bd_Sex === 'M' ? 'Male' : (this.Bd_Sex === 'F' ? 'Female' : this.Bd_Sex);
  }
  if (this.Bd_Phone) this.phone = this.Bd_Phone;
  if (this.Bd_reg_Date) this.registrationDate = this.Bd_reg_Date;

  // If old fields are set, sync to new fields
  if (this.name && !this.Bd_Name) this.Bd_Name = this.name;
  if (this.bloodGroup && !this.Bd_Bgroup) this.Bd_Bgroup = this.bloodGroup;
  if (this.age && !this.Bd_Age) this.Bd_Age = this.age;
  if (this.sex && !this.Bd_Sex) {
    this.Bd_Sex = this.sex === 'Male' ? 'M' : (this.sex === 'Female' ? 'F' : this.sex);
  }
  if (this.phone && !this.Bd_Phone) this.Bd_Phone = this.phone;
  if (this.registrationDate && !this.Bd_reg_Date) this.Bd_reg_Date = this.registrationDate;

  next();
});

// Index for faster queries
donorSchema.index({ Bd_Bgroup: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ City_Id: 1 });
donorSchema.index({ city: 1 });

module.exports = mongoose.model('Donor', donorSchema);
