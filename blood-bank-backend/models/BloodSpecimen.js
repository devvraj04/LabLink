const mongoose = require('mongoose');

const bloodSpecimenSchema = new mongoose.Schema({
  // SQL Schema fields (Primary)
  Specimen_Id: {
    type: Number,
    sparse: true,
  },
  B_Group: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    maxlength: 3
  },
  Status: {
    type: String,
    enum: ['available', 'reserved', 'used', 'contaminated'],
    default: 'available',
    maxlength: 20
  },
  
  // Old fields for backward compatibility
  specimenNumber: {
    type: String,
    unique: true,
    trim: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'used', 'contaminated'],
    default: 'available',
  },
  collectionDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
  },
}, {
  timestamps: true,
});

// Pre-save hook to sync fields
bloodSpecimenSchema.pre('save', function(next) {
  // Sync new to old
  if (this.B_Group) this.bloodGroup = this.B_Group;
  if (this.Status) this.status = this.Status;
  
  // Sync old to new
  if (this.bloodGroup && !this.B_Group) this.B_Group = this.bloodGroup;
  if (this.status && !this.Status) this.Status = this.status;
  
  // Update status if expired
  if (this.expiryDate < new Date() && this.status === 'available') {
    this.status = 'contaminated';
    this.Status = 'contaminated';
  }
  
  next();
});

// Index for faster queries (specimenNumber already has unique index from schema)
bloodSpecimenSchema.index({ B_Group: 1 });
bloodSpecimenSchema.index({ bloodGroup: 1 });
bloodSpecimenSchema.index({ Status: 1 });
bloodSpecimenSchema.index({ status: 1 });

// Virtual to check if specimen is expired
bloodSpecimenSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

module.exports = mongoose.model('BloodSpecimen', bloodSpecimenSchema);
