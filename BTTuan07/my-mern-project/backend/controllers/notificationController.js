const { Notification, NOTIFICATION_TYPES } = require('../models/Notification');
const User = require('../models/User');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');
const { emitToUser, emitToAdmins } = require('../services/socket.service');
const { sendNotificationEmail } = require('../services/mail.service');

/**
 * Tạo và gửi notification (internal helper)
 * @param {object} opts - { userId, type, title, message, data, sendEmail }
 */
async function createAndSendNotification({ userId, type, title, message, data = {}, sendEmail = false }) {
  const notification = await Notification.create({ user: userId, type, title, message, data });

  // Emit realtime via socket
  emitToUser(userId.toString(), 'notification', {
    _id: notification._id,
    type,
    title,
    message,
    data,
    isRead: false,
    createdAt: notification.createdAt,
  });

  // Gửi email nếu cần
  if (sendEmail) {
    try {
      const user = await User.findById(userId).select('email username');
      if (user?.email) {
        await sendNotificationEmail(user.email, title, message, user.username);
      }
    } catch (err) {
      console.error('Send notification email failed:', err.message);
    }
  }

  return notification;
}

/**
 * Tạo notification cho tất cả admin
 */
async function createAndSendAdminNotification({ type, title, message, data = {}, sendEmail = false }) {
  const admins = await User.find({ role: 'admin' }).select('_id email username');

  const notifications = await Promise.all(
    admins.map((admin) =>
      Notification.create({ user: admin._id, type, title, message, data })
    )
  );

  // Emit realtime cho admin room
  emitToAdmins('notification', {
    type,
    title,
    message,
    data,
    isRead: false,
    createdAt: new Date(),
  });

  // Gửi email cho từng admin nếu cần
  if (sendEmail) {
    for (const admin of admins) {
      try {
        await sendNotificationEmail(admin.email, title, message, admin.username);
      } catch (err) {
        console.error(`Send email to admin ${admin.email} failed:`, err.message);
      }
    }
  }

  return notifications;
}

// ============================================================
// Controller endpoints
// ============================================================

/**
 * GET /api/notifications
 * Lấy danh sách notification của user (phân trang)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: userId };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    return res.status(200).json(
      ApiResponse.paginated(notifications, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Lấy số notification chưa đọc
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    return res.status(200).json(ApiResponse.success({ count }));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Đánh dấu 1 notification đã đọc
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return next(new AppError('Không tìm thấy thông báo', 404));
    }
    return res.status(200).json(ApiResponse.success(notification));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 * Đánh dấu tất cả đã đọc
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json(ApiResponse.success(null, 'Đã đánh dấu tất cả là đã đọc'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Xóa 1 notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) {
      return next(new AppError('Không tìm thấy thông báo', 404));
    }
    return res.status(200).json(ApiResponse.success(null, 'Đã xóa thông báo'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // internal helpers
  createAndSendNotification,
  createAndSendAdminNotification,
};
