const mongoose = require('mongoose');
const { Schema } = mongoose;

const COUPON_TYPES = {
  PERCENT: 'PERCENT',   // Giảm theo %
  FIXED: 'FIXED',       // Giảm số tiền cố định
};

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    type: { type: String, enum: Object.values(COUPON_TYPES), required: true },
    value: { type: Number, required: true, min: 0 }, // % hoặc VND
    minOrderAmount: { type: Number, default: 0 },     // Đơn tối thiểu
    maxDiscountAmount: { type: Number, default: null },// Giới hạn giảm tối đa (cho PERCENT)

    // Giới hạn sử dụng
    usageLimit: { type: Number, default: null },       // null = không giới hạn
    usageCount: { type: Number, default: 0 },
    usageLimitPerUser: { type: Number, default: 1 },

    // Ai đã dùng
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Thời hạn
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },

    isActive: { type: Boolean, default: true },

    // Nguồn gốc (admin tạo hoặc hệ thống tự tạo từ loyalty)
    createdBy: { type: String, enum: ['admin', 'system'], default: 'admin' },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // null = public
  },
  {
    timestamps: true,
    toJSON: { transform(doc, ret) { delete ret.__v; return ret; } },
  }
);

couponSchema.index({ code: 1 });
couponSchema.index({ endDate: 1 });
couponSchema.index({ targetUser: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = { Coupon, COUPON_TYPES };
