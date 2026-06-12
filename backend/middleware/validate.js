const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    const message = `Validation failed: ${extractedErrors.map(e => e.message).join('. ')}`;
    return next(new ApiError(400, message, extractedErrors));
  }
  next();
};

module.exports = validate;
