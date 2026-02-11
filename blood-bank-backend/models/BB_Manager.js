const mongoose = require('mongoose');

const bbManagerSchema = new mongoose.Schema({
  M_Id: {
    type: Number,
    sparse: true,
  },
  M_Name: {
    type: String,
    trim: true,
    maxlength: [100, 'Manager name cannot exceed 100 characters']
  },
  M_Phone: {
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

bbManagerSchema.pre('save', function(next) {
  if (this.M_Name) this.name = this.M_Name;
  if (this.M_Phone) this.phone = this.M_Phone;

  if (this.name && !this.M_Name) this.M_Name = this.name;
  if (this.phone && !this.M_Phone) this.M_Phone = this.phone;

  next();
});

bbManagerSchema.index({ M_Id: 1 });
bbManagerSchema.index({ M_Name: 1 });

module.exports = mongoose.model('BB_Manager', bbManagerSchema);
