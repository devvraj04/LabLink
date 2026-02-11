const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['hospital', 'admin'],
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    unique: true // One chat per hospital
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalEmail: {
    type: String
  },
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageTime: {
    type: Date
  },
  lastMessageSender: {
    type: String,
    enum: ['hospital', 'admin']
  },
  unreadCount: {
    admin: { type: Number, default: 0 },
    hospital: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ hospitalId: 1 });
chatSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Chat', chatSchema);
