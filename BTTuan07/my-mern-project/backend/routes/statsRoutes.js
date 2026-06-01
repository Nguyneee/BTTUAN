const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getRevenueStats,
  getOrderStats,
  getCashflowStats,
  getCustomerStats,
  getTopProducts,
  getOverview,
} = require('../controllers/statsController');

// Tất cả stats routes chỉ dành cho admin
router.use(authenticate, authorize('admin'));

// GET /api/stats/overview       — cards tổng quan
router.get('/overview', getOverview);

// GET /api/stats/revenue        — doanh thu theo thời gian
router.get('/revenue', getRevenueStats);

// GET /api/stats/orders         — đơn hàng theo trạng thái + danh sách
router.get('/orders', getOrderStats);

// GET /api/stats/cashflow       — dòng tiền (đang giao vs đã giao)
router.get('/cashflow', getCashflowStats);

// GET /api/stats/customers      — khách hàng mới theo thời gian
router.get('/customers', getCustomerStats);

// GET /api/stats/top-products   — top sản phẩm bán chạy
router.get('/top-products', getTopProducts);

module.exports = router;
