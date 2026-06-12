const logger = require('../utils/logger');

const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = [];

  required.forEach((variable) => {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    logger.error(`CRITICAL CONFIGURATION ERROR: Missing required environment variable(s): ${missing.join(', ')}`);
    logger.error('The application will fail-fast now.');
    process.exit(1);
  } else {
    logger.info('Environment variables validation successful.');
  }
};

module.exports = validateEnv;
