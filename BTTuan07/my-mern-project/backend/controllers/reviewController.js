const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { Order, ORDER_STATUS } = require('../models/Order');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');
const { createAndSendAdminNotification } = require('./notificationController');
const { NOTIFICATION_TYPES } = require('../models/Notification');

// Thưởng khi đánh giá: 50 điểm/đánh giá
const REVIEW_REWARD_POINTS = 50;

/**
 * Helper: cập nhật rating trung bình của sản phẩm
 */
async function recalcProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const avg = result[0]?.avgRating || 0;
  const count = result[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count,
    commentCount: count,
  });
}

/**
 * GET /api/reviews/can-review/:orderId/:productId
 * Kiểm tra user có thể đánh giá sản phẩm này trong đơn này không
 */
const canReview = async (req, res, next) => {
  try {
    const { orderId, productId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId, status: ORDER_STATUS.DELIVERED });
    if (!order) {
      return res.status(200).json(ApiResponse.success({ canReview: false, reason: 'Đơn hàng chưa được giao thành công' }));
    }

    const hasProduct = order.items.some((item) => item.product.toString() === productId);
    if (!hasProduct) {
      return res.status(200).json(ApiResponse.success({ canReview: false, reason: 'Sản phẩm không có trong đơn hàng này' }));
    }

    const existing = await Review.findOne({ user: userId, product: productId, order: orderId });
    if (existing) {
      return res.status(200).json(ApiResponse.success({ canReview: false, reason: 'Bạn đã đánh giá sản phẩm này', review: existing }));
    }

    return res.status(200).json(ApiResponse.success({ canReview: true }));
  } catch (error) { next(error); }
};

/**
 * POST /api/reviews
 * Tạo đánh giá (chỉ với đơn DELIVERED, chưa đánh giá)
 */
const createReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, orderId, rating, comment, images } = req.body;

    if (!productId || !orderId || !rating) {
      return next(new AppError('productId, orderId và rating là bắt buộc', 400));
    }
    if (rating < 1 || rating > 5) {
      return next(new AppError('Rating phải từ 1 đến 5', 400));
    }

    // Kiểm tra đơn hàng đã giao
    const order = await Order.findOne({ _id: orderId, user: userId, status: ORDER_STATUS.DELIVERED });
    if (!order) return next(new AppError('Đơn hàng chưa được giao hoặc không tồn tại', 400));

    const hasProduct = order.items.some((item) => item.product.toString() === productId);
    if (!hasProduct) return next(new AppError('Sản phẩm không có trong đơn hàng này', 400));

    // Kiểm tra chưa đánh giá
    const existing = await Review.findOne({ user: userId, product: productId, order: orderId });
    if (existing) return next(new AppError('Bạn đã đánh giá sản phẩm này rồi', 400));

    // Tạo review
    const review = await Review.create({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      comment: comment || '',
      images: images || [],
      isVerifiedPurchase: true,
      rewardType: 'POINTS',
      rewardValue: REVIEW_REWARD_POINTS,
    });

    // Cập nhật rating sản phẩm và tăng buyerCount
    await recalcProductRating(review.product);

    // Tặng điểm tích lũy cho user
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: REVIEW_REWARD_POINTS },
      $push: {
        pointsHistory: {
          amount: REVIEW_REWARD_POINTS,
          type: 'EARN',
          reason: `Đánh giá sản phẩm — Đơn ${order.orderCode}`,
        },
      },
    });

    // Notify admin
    createAndSendAdminNotification({
      type: NOTIFICATION_TYPES.REVIEW_NEW,
      title: '⭐ Đánh giá mới!',
      message: `${req.user.username} vừa đánh giá sản phẩm ${rating}⭐. "${comment?.slice(0, 60) || 'Không có bình luận'}"`,
      data: { productId, reviewId: review._id },
    }).catch(console.error);

    await review.populate('user', 'username avatar');

    return res.status(201).json(
      ApiResponse.success(
        { review, rewardPoints: REVIEW_REWARD_POINTS },
        `Đánh giá thành công! Bạn được tặng ${REVIEW_REWARD_POINTS} điểm tích lũy 🎉`
      )
    );
  } catch (error) {
    if (error.code === 11000) return next(new AppError('Bạn đã đánh giá sản phẩm này rồi', 400));
    next(error);
  }
};

/**
 * GET /api/reviews/product/:productId
 * Lấy đánh giá của sản phẩm (phân trang, sort)
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest', rating } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { product: productId };
    if (rating) query.rating = parseInt(rating);

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, highest: { rating: -1 }, lowest: { rating: 1 } };
    const sortOpt = sortMap[sort] || sortMap.newest;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sortOpt)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username avatar'),
      Review.countDocuments(query),
    ]);

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach((d) => { ratingDist[d._id] = d.count; });

    return res.status(200).json(
      ApiResponse.paginated(reviews, {
        page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)),
        ratingDistribution: ratingDist,
      })
    );
  } catch (error) { next(error); }
};

/**
 * GET /api/reviews/my
 * Đánh giá của user hiện tại
 */
const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('product', 'name images imageUrl price'),
      Review.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json(
      ApiResponse.paginated(reviews, {
        page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)),
      })
    );
  } catch (error) { next(error); }
};

/**
 * GET /api/reviews/my-points
 * Xem điểm tích lũy + lịch sử
 */
const getMyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+pointsHistory loyaltyPoints');
    return res.status(200).json(
      ApiResponse.success({
        loyaltyPoints: user.loyaltyPoints,
        history: (user.pointsHistory || []).slice().reverse().slice(0, 50),
      })
    );
  } catch (error) { next(error); }
};

module.exports = { canReview, createReview, getProductReviews, getMyReviews, getMyPoints };
