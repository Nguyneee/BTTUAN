const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// Tất cả routes đều cần đăng nhập
router.use(authenticate);

// GET /api/notifications - danh sách thông báo
router.get('/', getMyNotifications);

// GET /api/notifications/unread-count - số chưa đọc
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/read-all - đánh dấu tất cả đã đọc
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - đánh dấu 1 đã đọc
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id - xóa thông báo
router.delete('/:id', deleteNotification);

module.exports = router;
