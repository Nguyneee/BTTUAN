const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

/**
 * Product Routes
 * Base path: /api/products
 *
 * GET    /api/products        → Public (with filters)
 * GET    /api/products/:id    → Public (+ similarProducts)
 * POST   /api/products        → Admin only
 * PUT    /api/products/:id    → Admin only
 * DELETE /api/products/:id    → Admin only
 */

router
  .route("/")
  .get(getAllProducts)
  .post(authenticate, authorize("admin"), createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(authenticate, authorize("admin"), updateProduct)
  .delete(authenticate, authorize("admin"), deleteProduct);

module.exports = router;
