const bcrypt = require('bcryptjs');
const userDao = require('../models/user.dao');
const { generateToken } = require('../utils/jwt');
const { success, error, badRequest } = require('../utils/response');

class AuthService {
  /** Register a new user (requires invite code) */
  async register({ username, password, email = '', inviteCode = '' }) {
    if (!username || !password) {
      return { status: 400, result: badRequest(null, 'Username and password are required') };
    }
    if (username.length < 2 || username.length > 20) {
      return { status: 400, result: badRequest(null, 'Username must be 2-20 characters') };
    }
    if (password.length < 6) {
      return { status: 400, result: badRequest(null, 'Password must be at least 6 characters') };
    }

    // Invite code validation
    const validCodes = ['yjh520', 'love520', 'forever', '我爱你阳婧欢', '缐廷华', 'xt520', '我们在一起'];
    if (!inviteCode || !validCodes.includes(inviteCode)) {
      return { status: 403, result: error(null, '邀请码无效，请输入正确的邀请码', 403) };
    }

    const existing = userDao.findByUsername(username);
    if (existing) {
      return { status: 400, result: badRequest(null, 'Username already exists') };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = userDao.create({ username, passwordHash, email, nickname: username });
    const token = generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;
    return { status: 201, result: success({ token, user: userWithoutPassword }, 'Registration successful') };
  }

  /** Login */
  async login({ username, password }) {
    if (!username || !password) {
      return { status: 400, result: badRequest(null, 'Username and password are required') };
    }

    const user = userDao.findByUsername(username);
    if (!user) {
      return { status: 401, result: error(null, 'Invalid username or password', 401) };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { status: 401, result: error(null, 'Invalid username or password', 401) };
    }

    const token = generateToken(user);
    const { password_hash, ...userWithoutPassword } = user;
    return { status: 200, result: success({ token, user: userWithoutPassword }, 'Login successful') };
  }

  /** Get user profile */
  getProfile(userId) {
    const user = userDao.findById(userId);
    if (!user) {
      return { status: 404, result: error(null, 'User not found', 404) };
    }
    return { status: 200, result: success(user) };
  }

  /** Update user profile */
  updateProfile(userId, data) {
    const user = userDao.findById(userId);
    if (!user) {
      return { status: 404, result: error(null, 'User not found', 404) };
    }
    const updated = userDao.update(userId, data);
    return { status: 200, result: success(updated, 'Profile updated') };
  }
}

module.exports = new AuthService();
