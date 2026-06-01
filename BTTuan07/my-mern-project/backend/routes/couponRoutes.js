const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  validateCouponAPI,
  getMyCoupons,
  exchangePointsToCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon
} = require('../controllers/couponController');

// User routes (Authenticated)
router.get('/my', authenticate, getMyCoupons);
router.post('/validate', authenticate, validateCouponAPI);
router.post('/exchange-points', authenticate, exchangePointsToCoupon);

// Admin routes (Admin only)
router.get('/', authenticate, authorize('admin'), getAllCoupons);
router.post('/', authenticate, authorize('admin'), createCoupon);
router.put('/:id', authenticate, authorize('admin'), updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleCoupon);

module.exports = router;
