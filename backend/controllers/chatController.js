const Chat = require('../models/Chat');

// @desc    Send/save chat message
// @route   POST /api/chats/send
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    const chat = await Chat.create({
      senderId: req.user.id,
      receiverId,
      message
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat thread history with specific user
// @route   GET /api/chats/:userId
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const chatPartnerId = req.params.userId;
    const currentUserId = req.user.id;

    // Fetch conversation between current user and requested user
    const chats = await Chat.find({
      $or: [
        { senderId: currentUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 }); // Sorted oldest to newest for chronological chat stream

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};
