const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All chat operations require authorization

router.post('/send', sendMessage);
router.get('/:userId', getChatHistory);

module.exports = router;
