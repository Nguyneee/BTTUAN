const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    images: { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: true },
    // Phần thưởng đã tặng khi đánh giá
    rewardType: { type: String, enum: ['POINTS', 'COUPON', null], default: null },
    rewardValue: { type: Number, default: 0 }, // điểm hoặc % giảm giá
  },
  {
    timestamps: true,
    toJSON: { transform(doc, ret) { delete ret.__v; return ret; } },
  }
);

// Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
