const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: false // Made optional to allow non-registered users
  },
  donorName: {
    type: String,
    required: true
  },
  donorPhone: {
    type: String,
    required: true
  },
  donorEmail: {
    type: String
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']
  },
  location: {
    type: String,
    required: true
  },
  locationAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  healthQuestionnaire: {
    weight: { type: Number },
    recentIllness: { type: Boolean, default: false },
    medications: { type: String },
    recentTravel: { type: Boolean, default: false },
    chronicConditions: { type: String },
    lastDonationDate: { type: Date },
    isEligible: { type: Boolean, default: true }
  },
  reminderSent24h: {
    type: Boolean,
    default: false
  },
  reminderSent2h: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ donorId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
