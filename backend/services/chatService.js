const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class ChatService {
  async sendMessage(senderId, receiverId, message) {
    // Basic verification of receiver existence
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      throw new ApiError(444, 'Receiver user not found');
    }

    return await Chat.create({
      senderId,
      receiverId,
      message,
      isRead: false
    });
  }

  async getChatHistory(currentUserId, chatPartnerId, queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { senderId: currentUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: currentUserId }
      ]
    };

    // Retrieve messages (newest first for pagination slicing)
    const [messages, total] = await Promise.all([
      Chat.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments(query)
    ]);

    // Mark any unread messages from partner to current user as read (Automatic Read Receipts)
    await Chat.updateMany(
      { senderId: chatPartnerId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    // Return chronological order (oldest to newest) for history display
    const chronologicalMessages = messages.reverse();

    return {
      messages: chronologicalMessages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        limit
      }
    };
  }

  async markAllAsRead(userId, partnerId) {
    await Chat.updateMany(
      { senderId: partnerId, receiverId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return true;
  }

  async getUnreadCount(userId) {
    const totalUnread = await Chat.countDocuments({ receiverId: userId, isRead: false });

    const breakdown = await Chat.aggregate([
      { $match: { receiverId: new mongoose.Types.ObjectId(userId), isRead: false } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } }
    ]);

    // Populate sender details for breakdown
    const senderBreakdown = await Promise.all(
      breakdown.map(async (item) => {
        const sender = await User.findById(item._id).select('name email role');
        return {
          sender: {
            id: item._id,
            name: sender ? sender.name : 'Unknown',
            email: sender ? sender.email : '',
            role: sender ? sender.role : ''
          },
          unreadCount: item.count
        };
      })
    );

    return {
      totalUnread,
      breakdown: senderBreakdown
    };
  }

  async getConversations(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate unique conversation threads based on messages sent or received
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userObjectId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          lastSenderId: { $first: '$senderId' }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    // Populate partner details and compute unread counts per thread
    const conversationList = await Promise.all(
      conversations.map(async (convo) => {
        const partnerId = convo._id;
        const partner = await User.findById(partnerId).select('name email role');
        const unreadCount = await Chat.countDocuments({
          senderId: partnerId,
          receiverId: userId,
          isRead: false
        });

        return {
          partner: {
            id: partnerId,
            name: partner ? partner.name : 'Unknown User',
            email: partner ? partner.email : '',
            role: partner ? partner.role : ''
          },
          lastMessage: convo.lastMessage,
          lastMessageAt: convo.lastMessageAt,
          lastSenderId: convo.lastSenderId,
          unreadCount
        };
      })
    );

    return conversationList;
  }
}

module.exports = new ChatService();
