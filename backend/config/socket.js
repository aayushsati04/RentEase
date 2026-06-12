const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*', // For production, limit this to actual domain
      methods: ['GET', 'POST']
    }
  });

  // Socket.io JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id name email role');
        if (user) {
          socket.user = user;
        }
      }
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      // Proceed unauthenticated or return next(new Error('Authentication failed'));
      next();
    }
  });

  io.on('connection', (socket) => {
    // Auto-join specific room if authenticated
    if (socket.user) {
      const room = socket.user._id.toString();
      socket.join(room);
      console.log(`[Socket] User ${socket.user.name} (${room}) joined private room`);
    }

    // Support legacy client join event
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`[Socket] Legacy join registered room: ${userId}`);
    });

    // Real-time messaging
    socket.on('private_message', async ({ senderId, receiverId, message }) => {
      try {
        const resolvedSenderId = socket.user ? socket.user._id.toString() : senderId;
        const chatService = require('../services/chatService');
        
        // Save to DB in real-time
        const chat = await chatService.sendMessage(resolvedSenderId, receiverId, message);
        
        // Emit message to receiver and sender rooms
        io.to(receiverId).emit('message', chat);
        io.to(resolvedSenderId).emit('message', chat);
      } catch (err) {
        console.error('[Socket] Error in private_message:', err.message);
      }
    });

    // Real-time typing notification
    socket.on('typing', ({ receiverId, isTyping }) => {
      const resolvedSenderId = socket.user ? socket.user._id.toString() : null;
      if (resolvedSenderId) {
        io.to(receiverId).emit('typing_status', { senderId: resolvedSenderId, isTyping });
      }
    });

    // Real-time read receipt notification
    socket.on('mark_read', async ({ partnerId }) => {
      try {
        const resolvedUserId = socket.user ? socket.user._id.toString() : null;
        if (resolvedUserId) {
          const chatService = require('../services/chatService');
          await chatService.markAllAsRead(resolvedUserId, partnerId);
          io.to(partnerId).emit('messages_read', { readerId: resolvedUserId });
        }
      } catch (err) {
        console.error('[Socket] Error marking messages read:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Please call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
