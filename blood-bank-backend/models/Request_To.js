const mongoose = require('mongoose');

const requestToSchema = new mongoose.Schema({
  Reci_Id: {
    type: Number,
    required: true,
  },
  M_Id: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

requestToSchema.index({ Reci_Id: 1, M_Id: 1 }, { unique: false });

module.exports = mongoose.model('Request_To', requestToSchema);
