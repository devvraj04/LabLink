const mongoose = require('mongoose');

const recordingStaffSchema = new mongoose.Schema({
  Reco_Id: {
    type: Number,
    sparse: true,
  },
  Reco_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Recording staff name cannot exceed 100 characters']
  },
  Reco_Phone: {
    type: String,
    trim: true,
    maxlength: [15, 'Phone cannot exceed 15 characters']
  },

  // Backward-compatible fields
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

recordingStaffSchema.pre('save', function(next) {
  if (this.Reco_Name) this.name = this.Reco_Name;
  if (this.Reco_Phone) this.phone = this.Reco_Phone;

  if (this.name && !this.Reco_Name) this.Reco_Name = this.name;
  if (this.phone && !this.Reco_Phone) this.Reco_Phone = this.phone;

  next();
});

recordingStaffSchema.index({ Reco_Id: 1 });
recordingStaffSchema.index({ Reco_Name: 1 });

module.exports = mongoose.model('Recording_Staff', recordingStaffSchema);
