const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  City_Id: {
    type: Number,
    required: true,
    unique: true
  },
  City_Name: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('City', citySchema);
