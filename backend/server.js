const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io integration
const io = socketio(server, {
  cors: {
    origin: '*', // In production, replace with specific frontend domain
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Socket.io Connection Event Handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins their personal room based on userId
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle direct messages
  socket.on('private_message', ({ senderId, receiverId, message }) => {
    // Broadcast message to the receiver
    io.to(receiverId).emit('message', {
      senderId,
      receiverId,
      message,
      createdAt: new Date()
    });

    // Also echo back to the sender
    io.to(senderId).emit('message', {
      senderId,
      receiverId,
      message,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});

// Mount Routes (Placeholders mapped in next step)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'RentEase API is running' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
