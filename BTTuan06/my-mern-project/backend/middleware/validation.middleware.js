const { validationResult, body, query, param } = require('express-validator');

/**
 * Validation middleware - handles validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: formattedErrors,
      },
    });
  }
  next();
};

/**
 * Register validation rules
 */
const registerRules = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .trim(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới')
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  validate,
];

/**
 * Login validation rules
 */
const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
  validate,
];

/**
 * Verify OTP validation rules
 */
const verifyOtpRules = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã OTP phải 6 chữ số')
    .isNumeric()
    .withMessage('Mã OTP chỉ chứa số'),
  validate,
];

/**
 * Forgot password validation rules
 */
const forgotPasswordRules = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .trim(),
  validate,
];

/**
 * Reset password validation rules
 */
const resetPasswordRules = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail()
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã OTP phải 6 chữ số')
    .isNumeric()
    .withMessage('Mã OTP chỉ chứa số'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  validate,
];

/**
 * Change password validation rules (for logged-in users)
 */
const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  validate,
];

/**
 * Update profile validation rules
 */
const updateProfileRules = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar phải là URL hợp lệ')
    .trim(),
  validate,
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  verifyOtpRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  updateProfileRules,
};
