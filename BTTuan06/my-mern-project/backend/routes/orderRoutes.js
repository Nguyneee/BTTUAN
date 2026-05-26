const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const orderController = require('../controllers/orderController');

/**
 * ========================
 * MEMBER ROUTES
 * ========================
 */

// Create order (from cart)
router.post('/', authenticate, orderController.createOrder);

// Get my orders (paginated)
router.get('/', authenticate, orderController.getMyOrders);

// Get order detail
router.get('/:id', authenticate, orderController.getOrderDetail);

// Cancel order (within 30 min for PENDING, or CONFIRMED)
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// Request cancel (when PROCESSING)
router.put('/:id/request-cancel', authenticate, orderController.requestCancelOrder);

/**
 * ========================
 * ADMIN ROUTES
 * ========================
 */

// Get all orders (admin)
router.get('/admin/all', authenticate, authorize('admin'), orderController.getAllOrders);

// Get order stats (admin)
router.get('/admin/stats', authenticate, authorize('admin'), orderController.getOrderStats);

// Get single order detail (admin)
router.get('/admin/:id', authenticate, authorize('admin'), orderController.getAdminOrderDetail);

// Update order status (admin)
router.put('/:id/status', authenticate, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
