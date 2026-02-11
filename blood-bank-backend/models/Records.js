const mongoose = require('mongoose');

const recordsSchema = new mongoose.Schema({
  Reco_Id: {
    type: Number,
    required: true,
  },
  Reci_Id: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

recordsSchema.index({ Reco_Id: 1, Reci_Id: 1 }, { unique: false });

module.exports = mongoose.model('Records', recordsSchema);
