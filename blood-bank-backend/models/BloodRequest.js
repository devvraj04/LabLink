const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalEmail: {
    type: String
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    enum: ['units', 'ml'],
    default: 'units'
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  patientDetails: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  requiredBy: {
    type: Date
  },
  responseDate: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedByName: {
    type: String
  },
  adminNotes: {
    type: String,
    trim: true
  },
  fulfillmentDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
bloodRequestSchema.index({ hospitalId: 1 });
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ requestDate: -1 });
bloodRequestSchema.index({ urgency: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
