const { body, param, query } = require('express-validator');

const sendMessageValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid Receiver ID format'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
];

const getChatHistoryValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit count must be a positive integer')
];

const markReadValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid Partner User ID format')
];

module.exports = {
  sendMessageValidator,
  getChatHistoryValidator,
  markReadValidator
};
