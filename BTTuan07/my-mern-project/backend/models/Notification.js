const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Notification Types
 */
const NOTIFICATION_TYPES = {
  ORDER_NEW: 'ORDER_NEW',               // Admin: có đơn hàng mới
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED', // User: trạng thái đơn thay đổi
  REVIEW_NEW: 'REVIEW_NEW',             // Admin: có đánh giá mới
  COMMENT_NEW: 'COMMENT_NEW',           // Admin: có bình luận mới
  SYSTEM: 'SYSTEM',                     // Hệ thống
};

const notificationSchema = new Schema(
  {
    // Người nhận thông báo
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Dữ liệu bổ sung (link, orderId, productId...)
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, NOTIFICATION_TYPES };
