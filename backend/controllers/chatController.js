const chatService = require('../services/chatService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Send/save chat message
// @route   POST /api/chats/send
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, message } = req.body;
  const chat = await chatService.sendMessage(req.user.id, receiverId, message);

  res.status(201).json(
    new ApiResponse(201, 'Message sent successfully', chat)
  );
});

// @desc    Get chat thread history with specific user (paginated)
// @route   GET /api/chats/:userId
// @access  Private
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { messages, pagination } = await chatService.getChatHistory(
    req.user.id,
    req.params.userId,
    req.query
  );

  res.status(200).json({
    success: true,
    message: 'Chat history retrieved successfully',
    count: messages.length,
    pagination,
    data: messages
  });
});

// @desc    Get all active conversations list
// @route   GET /api/chats/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await chatService.getConversations(req.user.id);

  res.status(200).json(
    new ApiResponse(200, 'Conversations retrieved successfully', conversations)
  );
});

// @desc    Get unread message counts (total and breakdown)
// @route   GET /api/chats/unread/count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const counts = await chatService.getUnreadCount(req.user.id);

  res.status(200).json(
    new ApiResponse(200, 'Unread message counts retrieved successfully', counts)
  );
});

// @desc    Mark all messages in a thread from partner as read
// @route   PUT /api/chats/read-all/:userId
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await chatService.markAllAsRead(req.user.id, req.params.userId);

  res.status(200).json(
    new ApiResponse(200, 'Messages marked as read successfully', {})
  );
});
