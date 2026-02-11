const mongoose = require('mongoose');

const donorResponseSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  donorName: {
    type: String
  },
  donorPhone: {
    type: String
  },
  responseStatus: {
    type: String,
    enum: ['accepted', 'declined', 'pending'],
    default: 'pending'
  },
  responseTime: {
    type: Date,
    default: Date.now
  },
  eta: {
    type: String
  },
  distance: {
    type: Number
  }
});

const emergencyRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'urgent'],
    default: 'urgent'
  },
  patientCondition: {
    type: String,
    required: true
  },
  location: {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    address: { type: String }
  },
  broadcastRadius: {
    type: Number,
    default: 50 // kilometers
  },
  donorsNotified: {
    type: Number,
    default: 0
  },
  donorResponses: [donorResponseSchema],
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'expired', 'cancelled'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  fulfilledAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
emergencyRequestSchema.index({ 'location.coordinates': '2dsphere' });
emergencyRequestSchema.index({ status: 1, expiresAt: 1 });
emergencyRequestSchema.index({ bloodGroup: 1, status: 1 });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
