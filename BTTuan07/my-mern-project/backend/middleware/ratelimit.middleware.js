const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for registration endpoint
 * 5 requests per 15 minutes per IP
 */
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 15 phút.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + email combination for more granular limiting
    return `${req.ip}-${req.body.email || 'unknown'}`;
  },
});

/**
 * Rate limiter for login endpoint
 * 10 requests per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for OTP verification
 * 5 requests per 5 minutes per IP
 */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Quá nhiều yêu cầu xác thực OTP. Vui lòng thử lại sau 5 phút.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for forgot password
 * 3 requests per 5 minutes per IP
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 5 phút.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  registerLimiter,
  loginLimiter,
  otpLimiter,
  forgotPasswordLimiter,
  generalLimiter,
};
