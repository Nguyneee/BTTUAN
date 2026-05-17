const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateMe,
} = require("../controllers/authController");

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

module.exports = router;
