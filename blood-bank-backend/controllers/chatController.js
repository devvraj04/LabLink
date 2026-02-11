const Chat = require('../models/Chat');
const Hospital = require('../models/Hospital');

// @desc    Send message from hospital to admin
// @route   POST /api/hospital/chat/send
// @access  Private (Hospital)
exports.sendMessageFromHospital = async (req, res) => {
  try {
    const { message } = req.body;
    const hospitalId = req.hospital._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty' 
      });
    }

    // Find or create chat
    let chat = await Chat.findOne({ hospitalId });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        hospitalId,
        hospitalName: req.hospital.Hosp_Name,
        hospitalEmail: req.hospital.email,
        messages: [],
        unreadCount: { admin: 0, hospital: 0 }
      });
    }

    // Add message
    const newMessage = {
      sender: 'hospital',
      senderName: req.hospital.Hosp_Name,
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = 'hospital';
    chat.unreadCount.admin += 1; // Increment admin unread count

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: chat.messages[chat.messages.length - 1]._id,
        timestamp: newMessage.timestamp,
        unreadCount: chat.unreadCount
      }
    });
  } catch (error) {
    console.error('Error in sendMessageFromHospital:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get hospital's chat messages
// @route   GET /api/hospital/chat/messages
// @access  Private (Hospital)
exports.getHospitalMessages = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;

    const chat = await Chat.findOne({ hospitalId });

    if (!chat) {
      return res.json({
        success: true,
        data: {
          messages: [],
          unreadCount: 0
        }
      });
    }

    // Mark hospital messages as read
    let hasUnread = false;
    chat.messages.forEach(msg => {
      if (msg.sender === 'admin' && !msg.isRead) {
        msg.isRead = true;
        hasUnread = true;
      }
    });

    if (hasUnread) {
      chat.unreadCount.hospital = 0;
      await chat.save();
    }

    res.json({
      success: true,
      data: {
        messages: chat.messages,
        unreadCount: chat.unreadCount.hospital,
        lastMessageTime: chat.lastMessageTime
      }
    });
  } catch (error) {
    console.error('Error in getHospitalMessages:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get hospital's unread message count
// @route   GET /api/hospital/chat/unread-count
// @access  Private (Hospital)
exports.getHospitalUnreadCount = async (req, res) => {
  try {
    const hospitalId = req.hospital._id;

    const chat = await Chat.findOne({ hospitalId });

    res.json({
      success: true,
      data: {
        unreadCount: chat ? chat.unreadCount.hospital : 0
      }
    });
  } catch (error) {
    console.error('Error in getHospitalUnreadCount:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============= ADMIN SIDE =============

// @desc    Get all chat conversations (for admin) - includes all hospitals
// @route   GET /api/admin/chat/conversations
// @access  Private (Admin)
exports.getAllConversations = async (req, res) => {
  try {
    // Get all hospitals (both approved and pending) - Admin should see all
    const hospitals = await Hospital.find({})
      .select('_id Hosp_Name email isApproved')
      .sort({ Hosp_Name: 1 });

    // Get existing chats
    const chats = await Chat.find({ isActive: true })
      .select('hospitalId hospitalName hospitalEmail lastMessage lastMessageTime lastMessageSender unreadCount');

    // Create a map of existing chats
    const chatMap = {};
    chats.forEach(chat => {
      chatMap[chat.hospitalId.toString()] = chat;
    });

    // Build conversation list with all hospitals
    const conversations = hospitals.map(hospital => {
      const existingChat = chatMap[hospital._id.toString()];
      
      if (existingChat) {
        return {
          ...existingChat.toObject(),
          isApproved: hospital.isApproved
        };
      } else {
        // Return hospital without chat history (admin can initiate)
        return {
          hospitalId: hospital._id,
          hospitalName: hospital.Hosp_Name || hospital.name,
          hospitalEmail: hospital.email,
          lastMessage: null,
          lastMessageTime: null,
          lastMessageSender: null,
          unreadCount: { admin: 0, hospital: 0 },
          messages: [],
          isApproved: hospital.isApproved
        };
      }
    });

    // Sort by lastMessageTime (nulls at end)
    conversations.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error in getAllConversations:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get messages for specific hospital (admin view)
// @route   GET /api/admin/chat/messages/:hospitalId
// @access  Private (Admin)
exports.getConversationMessages = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    let chat = await Chat.findOne({ hospitalId });

    // If no chat exists, get hospital info and return empty chat
    if (!chat) {
      const hospital = await Hospital.findById(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({ 
          success: false, 
          message: 'Hospital not found' 
        });
      }

      return res.json({
        success: true,
        data: {
          hospitalName: hospital.Hosp_Name || hospital.name,
          hospitalEmail: hospital.email,
          messages: [],
          unreadCount: 0
        }
      });
    }

    // Mark admin messages as read
    let hasUnread = false;
    chat.messages.forEach(msg => {
      if (msg.sender === 'hospital' && !msg.isRead) {
        msg.isRead = true;
        hasUnread = true;
      }
    });

    if (hasUnread) {
      chat.unreadCount.admin = 0;
      await chat.save();
    }

    res.json({
      success: true,
      data: {
        hospitalName: chat.hospitalName,
        hospitalEmail: chat.hospitalEmail,
        messages: chat.messages,
        unreadCount: chat.unreadCount.admin
      }
    });
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Send message from admin to hospital
// @route   POST /api/admin/chat/send/:hospitalId
// @access  Private (Admin)
exports.sendMessageFromAdmin = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty' 
      });
    }

    let chat = await Chat.findOne({ hospitalId });

    if (!chat) {
      // Get hospital details
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({ 
          success: false, 
          message: 'Hospital not found' 
        });
      }

      // Create chat
      chat = await Chat.create({
        hospitalId,
        hospitalName: hospital.Hosp_Name,
        hospitalEmail: hospital.email,
        messages: [],
        unreadCount: { admin: 0, hospital: 0 }
      });
    }

    // Add message
    const newMessage = {
      sender: 'admin',
      senderName: req.user.username || 'Admin',
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = 'admin';
    chat.unreadCount.hospital += 1; // Increment hospital unread count

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: chat.messages[chat.messages.length - 1]._id,
        timestamp: newMessage.timestamp
      }
    });
  } catch (error) {
    console.error('Error in sendMessageFromAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get total unread count for admin
// @route   GET /api/admin/chat/unread-count
// @access  Private (Admin)
exports.getAdminUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ isActive: true });
    
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount.admin, 0);

    res.json({
      success: true,
      data: {
        totalUnread,
        conversations: chats.length
      }
    });
  } catch (error) {
    console.error('Error in getAdminUnreadCount:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
