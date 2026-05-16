const jwt = require('jsonwebtoken');
const config = require('../config');

/** Generate a JWT token for a user */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/** Verify a JWT token, returns decoded payload or null */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
