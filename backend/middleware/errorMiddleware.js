const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Ensure it is mapped as an ApiError instance
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' || error.name === 'CastError' || error.code === 11000 ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  // Extract Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key index error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message);
  }

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message, Object.values(err.errors).map(val => ({ field: val.path, message: val.message })));
  }

  // Log to clean console logger
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`${error.statusCode} - ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    error: {
      statusCode: error.statusCode,
      errors: error.errors || [],
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  });
};

module.exports = errorHandler;
