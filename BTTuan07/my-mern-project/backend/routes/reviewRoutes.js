const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { canReview, createReview, getProductReviews, getMyReviews, getMyPoints } = require('../controllers/reviewController');

// GET  /api/reviews/my              — đánh giá của tôi
router.get('/my', authenticate, getMyReviews);

// GET  /api/reviews/my-points       — điểm tích lũy + lịch sử
router.get('/my-points', authenticate, getMyPoints);

// GET  /api/reviews/can-review/:orderId/:productId
router.get('/can-review/:orderId/:productId', authenticate, canReview);

// POST /api/reviews                 — tạo đánh giá
router.post('/', authenticate, createReview);

// GET  /api/reviews/product/:productId — đánh giá của sản phẩm (public)
router.get('/product/:productId', getProductReviews);

module.exports = router;
