const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8080,
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data/love.db'),
};
