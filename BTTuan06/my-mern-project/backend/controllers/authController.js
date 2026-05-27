const User = require('../models/User');
const { AppError } = require('../shared/errors/AppError');
const { ApiResponse } = require('../shared/utils/apiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../shared/utils/jwt');
const { sendOtpEmail, generateOtp } = require('../services/mail.service');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;

/**
 * @desc   Register a new member (send OTP, don't activate yet)
 * @route  POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return next(new AppError('Tên đăng nhập đã tồn tại', 409));

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      // If email exists but not activated, resend OTP
      if (!existingEmail.isActivated) {
        const otpCode = generateOtp();
        const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        
        existingEmail.otpCode = otpCode;
        existingEmail.otpExpires = otpExpires;
        await existingEmail.save({ validateBeforeSave: false });

        const emailSent = await sendOtpEmail(email, otpCode, 'register', existingEmail.username);
        if (!emailSent) {
          return next(new AppError('Không thể gửi email xác thực. Vui lòng thử lại.', 500));
        }

        return res.status(200).json(
          ApiResponse.success(
            { email, message: 'Mã OTP mới đã được gửi. Vui lòng kiểm tra email.' },
            'Đăng ký đã được cập nhật'
          )
        );
      }
      // If email exists and is activated, block registration
      return next(new AppError('Email đã được sử dụng', 409));
    }

    // Generate OTP
    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Create user (not activated yet)
    const user = await User.create({
      email,
      username,
      password,
      isActivated: false,
      otpCode,
      otpExpires,
    });

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otpCode, 'register', username);

    if (!emailSent) {
      // Clean up user if email fails
      await User.findByIdAndDelete(user._id);
      return next(new AppError('Không thể gửi email xác thực. Vui lòng thử lại.', 500));
    }

    res.status(201).json(
      ApiResponse.success(
        { email, message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' },
        'Vui lòng xác thực tài khoản'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Verify OTP and activate account
 * @route  POST /api/auth/verify-otp
 * @access Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return next(new AppError('Email không tồn tại', 404));

    // Check if already activated
    if (user.isActivated) {
      return next(new AppError('Tài khoản đã được xác thực trước đó', 400));
    }

    // Check OTP
    if (!user.otpCode || !user.otpExpires) {
      return next(new AppError('Mã OTP không hợp lệ. Vui lòng đăng ký lại.', 400));
    }

    if (user.otpCode !== otp) {
      return next(new AppError('Mã OTP không đúng', 400));
    }

    if (new Date() > new Date(user.otpExpires)) {
      return next(new AppError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 400));
    }

    // Activate account and clear OTP
    user.isActivated = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();

    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        { user: user.toPublicProfile(), accessToken, refreshToken },
        'Xác thực tài khoản thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Resend OTP for registration
 * @route  POST /api/auth/resend-otp
 * @access Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return next(new AppError('Email không tồn tại', 404));

    if (user.isActivated) {
      return next(new AppError('Tài khoản đã được xác thực', 400));
    }

    // Generate new OTP
    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    // Send new OTP email
    const emailSent = await sendOtpEmail(email, otpCode, 'register', user.username);

    if (!emailSent) {
      return next(new AppError('Không thể gửi email. Vui lòng thử lại.', 500));
    }

    res.status(200).json(
      ApiResponse.success(
        { email, expiresIn: OTP_EXPIRY_MINUTES * 60 },
        `Mã OTP mới đã được gửi (hiệu lực trong ${OTP_EXPIRY_MINUTES} phút)`
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Login with email + password (returns redirectUrl based on role)
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return next(new AppError('Email hoặc mật khẩu không đúng', 401));

    // Check if account is activated
    if (!user.isActivated) {
      return next(new AppError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.', 401));
    }

    const match = await user.comparePassword(password);
    if (!match) return next(new AppError('Email hoặc mật khẩu không đúng', 401));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Determine redirect URL based on role
    const redirectUrl = user.role === 'admin' ? '/admin/profile' : '/user/profile';

    // Update refresh token + last login
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        {
          user: user.toPublicProfile(),
          accessToken,
          refreshToken,
          redirectUrl,
        },
        'Đăng nhập thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Forgot password - send OTP to email
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json(
        ApiResponse.success(
          { email, message: 'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi.' },
          'Yêu cầu đã được xử lý'
        )
      );
    }

    // Generate OTP for password reset
    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.resetPasswordOtp = otpCode;
    user.resetPasswordExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    const emailSent = await sendOtpEmail(email, otpCode, 'reset', user.username);

    if (!emailSent) {
      return next(new AppError('Không thể gửi email. Vui lòng thử lại.', 500));
    }

    res.status(200).json(
      ApiResponse.success(
        { email, expiresIn: OTP_EXPIRY_MINUTES * 60 },
        `Mã OTP đã được gửi đến email (hiệu lực trong ${OTP_EXPIRY_MINUTES} phút)`
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Reset password with valid OTP
 * @route  POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return next(new AppError('Email không tồn tại', 404));

    // Check OTP
    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return next(new AppError('Mã OTP không hợp lệ. Vui lòng yêu cầu mã mới.', 400));
    }

    if (user.resetPasswordOtp !== otp) {
      return next(new AppError('Mã OTP không đúng', 400));
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      return next(new AppError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 400));
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();

    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        { accessToken, refreshToken },
        'Đặt lại mật khẩu thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Change password (for logged-in users)
 * @route  PUT /api/auth/change-password
 * @access Protected
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return next(new AppError('Người dùng không tồn tại', 404));

    // Verify current password
    const match = await user.comparePassword(currentPassword);
    if (!match) return next(new AppError('Mật khẩu hiện tại không đúng', 400));

    // Update password
    user.password = newPassword;

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      ApiResponse.success(
        { accessToken, refreshToken },
        'Đổi mật khẩu thành công'
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

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) return next(new AppError('Tên đăng nhập đã được sử dụng', 409));
    }

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

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  refresh,
  logout,
  getMe,
  updateMe,
};
