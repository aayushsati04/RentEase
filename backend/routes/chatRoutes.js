const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getConversations,
  getUnreadCount,
  markAllAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessageValidator,
  getChatHistoryValidator,
  markReadValidator
} = require('../validations/chatValidation');
const validate = require('../middleware/validate');

router.use(protect); // All chat operations require authorization

router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.put('/read-all/:userId', markReadValidator, validate, markAllAsRead);
router.post('/send', sendMessageValidator, validate, sendMessage);
router.get('/:userId', getChatHistoryValidator, validate, getChatHistory);

module.exports = router;
