const mongoose = require('mongoose');

const registersSchema = new mongoose.Schema({
  Reco_Id: {
    type: Number,
    required: true,
  },
  Bd_Id: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

// Composite-like index for fast lookups
registersSchema.index({ Reco_Id: 1, Bd_Id: 1 }, { unique: false });

module.exports = mongoose.model('Registers', registersSchema);
