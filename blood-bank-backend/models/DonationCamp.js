const mongoose = require('mongoose');

const campRegistrationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
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
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  attended: {
    type: Boolean,
    default: false
  },
  donated: {
    type: Boolean,
    default: false
  }
});

const donationCampSchema = new mongoose.Schema({
  campName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  campDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  organizer: {
    type: String
  },
  contactPerson: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  expectedDonors: {
    type: Number,
    default: 50
  },
  registrations: [campRegistrationSchema],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  unitsCollected: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

donationCampSchema.index({ campDate: 1 });
donationCampSchema.index({ status: 1 });

module.exports = mongoose.model('DonationCamp', donationCampSchema);
