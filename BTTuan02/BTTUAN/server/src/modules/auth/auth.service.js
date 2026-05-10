const User = require('../user/user.model');
const redis = require('../../config/redis');
const { AppError } = require('../../shared/errors/AppError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../shared/utils/jwt');

const refreshKey = (userId) => `refresh:${userId}`;

class AuthService {
  async register({ email, username, password }) {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      if (existing.email === email) throw new AppError('Email already in use', 409);
      throw new AppError('Username already taken', 409);
    }
    const user = await User.create({ email, username, password });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await redis.set(refreshKey(String(user._id)), refreshToken, 'EX', 60 * 60 * 24 * 7);
    return { user: user.toPublicProfile(), accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);
    const match = await user.comparePassword(password);
    if (!match) throw new AppError('Invalid email or password', 401);
    user.lastLoginAt = new Date();
    await user.save();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await redis.set(refreshKey(String(user._id)), refreshToken, 'EX', 60 * 60 * 24 * 7);
    return { user: user.toPublicProfile(), accessToken, refreshToken };
  }

  async refresh(token) {
    if (!token) throw new AppError('Refresh token required', 400);
    const decoded = verifyRefreshToken(token);
    const stored = await redis.get(refreshKey(decoded.sub));
    if (!stored || stored !== token) throw new AppError('Invalid refresh token', 401);
    const user = await User.findById(decoded.sub);
    if (!user) throw new AppError('User not found', 401);
    const accessToken = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);
    await redis.set(refreshKey(String(user._id)), newRefresh, 'EX', 60 * 60 * 24 * 7);
    return { accessToken, refreshToken: newRefresh };
  }

  async logout(userId) {
    await redis.del(refreshKey(String(userId)));
  }
}

module.exports = new AuthService();
