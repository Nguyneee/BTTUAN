const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { incrementViewCount } = require("../middleware/view.middleware");
const {
  getAllProducts,
  getPopularProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

/**
 * Product Routes
 * Base path: /api/products
 *
 * GET    /api/products         → Public (with filters)
 * GET    /api/products/popular → Public (best sellers / most viewed)
 * GET    /api/products/:id     → Public (+ similarProducts) + view tracking
 * POST   /api/products         → Admin only
 * PUT    /api/products/:id     → Admin only
 * DELETE /api/products/:id      → Admin only
 */

router
  .route("/")
  .get(getAllProducts)
  .post(authenticate, authorize("admin"), createProduct);

// Popular products route (must be before /:id to avoid conflict)
router
  .route("/popular")
  .get(getPopularProducts);

router
  .route("/:id")
  .get(incrementViewCount, getProductById)
  .put(authenticate, authorize("admin"), updateProduct)
  .delete(authenticate, authorize("admin"), deleteProduct);

module.exports = router;
