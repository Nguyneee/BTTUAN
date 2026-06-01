const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getWishlist, toggleWishlist, checkWishlist, clearWishlist,
  recordView, getViewHistory, clearViewHistory,
} = require('../controllers/wishlistController');

// Tất cả routes yêu cầu đăng nhập
router.use(authenticate);

// ── Wishlist ──────────────────────────────────────────────────────────────
// GET    /api/wishlist                  — danh sách yêu thích
router.get('/', getWishlist);

// POST   /api/wishlist/toggle/:productId — toggle thêm/xóa
router.post('/toggle/:productId', toggleWishlist);

// GET    /api/wishlist/check/:productId  — kiểm tra trạng thái
router.get('/check/:productId', checkWishlist);

// DELETE /api/wishlist/clear             — xóa tất cả
router.delete('/clear', clearWishlist);

// ── View History ──────────────────────────────────────────────────────────
// GET    /api/wishlist/history           — lịch sử xem
router.get('/history', getViewHistory);

// POST   /api/wishlist/history/:productId — ghi lượt xem
router.post('/history/:productId', recordView);

// DELETE /api/wishlist/history           — xóa lịch sử
router.delete('/history', clearViewHistory);

module.exports = router;
