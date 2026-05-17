const User = require('../models/User');
const { AppError } = require('../shared/errors/AppError');
const { ApiResponse } = require('../shared/utils/apiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../shared/utils/jwt');

/**
 * @desc   Register a new member
 * @route  POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return next(new AppError('Vui lòng điền đầy đủ thông tin', 400));
    }

    // Check duplicates
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return next(new AppError('Email đã được sử dụng', 409));

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return next(new AppError('Tên đăng nhập đã tồn tại', 409));

    const user = await User.create({ email, username, password });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(201).json(
      ApiResponse.success(
        { user: user.toPublicProfile(), accessToken, refreshToken },
        'Đăng ký thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Login with email + password
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Vui lòng nhập email và mật khẩu', 400));
    }

    const user = await User.findByEmail(email);
    if (!user) return next(new AppError('Email hoặc mật khẩu không đúng', 401));

    const match = await user.comparePassword(password);
    if (!match) return next(new AppError('Email hoặc mật khẩu không đúng', 401));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token + last login
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        { user: user.toPublicProfile(), accessToken, refreshToken },
        'Đăng nhập thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Refresh access token using refresh token
 * @route  POST /api/auth/refresh
 * @access Public
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Refresh token là bắt buộc', 400));

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.sub).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Refresh token không hợp lệ', 401));
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        { accessToken, refreshToken: newRefreshToken },
        'Token đã được làm mới'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Logout — clear refresh token in DB
 * @route  POST /api/auth/logout
 * @access Protected
 */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.status(200).json(ApiResponse.success(null, 'Đăng xuất thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get current logged-in user profile
 * @route  GET /api/auth/me
 * @access Protected
 */
const getMe = async (req, res) => {
  res.status(200).json(ApiResponse.success(req.user, 'Lấy thông tin thành công'));
};

/**
 * @desc   Update current user profile (username, avatar)
 * @route  PUT /api/auth/me
 * @access Protected
 */
const updateMe = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, avatar },
      { new: true, runValidators: true }
    );
    res.status(200).json(ApiResponse.success(user, 'Cập nhật thành công'));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateMe };
