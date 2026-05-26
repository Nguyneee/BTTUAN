const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const cartController = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Get current user's cart
 */
router.get('/', cartController.getCart);

/**
 * POST /api/cart/items
 * Add item to cart
 * Body: { productId, quantity }
 */
router.post('/items', cartController.addItem);

/**
 * PUT /api/cart/items/:productId
 * Update item quantity
 * Body: { quantity }
 */
router.put('/items/:productId', cartController.updateItem);

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
router.delete('/items/:productId', cartController.removeItem);

/**
 * DELETE /api/cart
 * Clear cart
 */
router.delete('/', cartController.clearCart);

module.exports = router;
