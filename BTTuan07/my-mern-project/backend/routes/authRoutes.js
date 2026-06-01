const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const {
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
} = require("../controllers/authController");
const {
  registerRules,
  loginRules,
  verifyOtpRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  updateProfileRules,
} = require("../middleware/validation.middleware");
const {
  registerLimiter,
  loginLimiter,
  otpLimiter,
  forgotPasswordLimiter,
} = require("../middleware/ratelimit.middleware");

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Public routes with rate limiting and validation
router.post("/register", registerLimiter, registerRules, register);
router.post("/verify-otp", otpLimiter, verifyOtpRules, verifyOtp);
router.post("/resend-otp", otpLimiter, forgotPasswordRules, resendOtp);
router.post("/login", loginLimiter, loginRules, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordRules, forgotPassword);
router.post("/reset-password", otpLimiter, resetPasswordRules, resetPassword);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfileRules, updateMe);
router.put("/change-password", authenticate, changePasswordRules, changePassword);

module.exports = router;
