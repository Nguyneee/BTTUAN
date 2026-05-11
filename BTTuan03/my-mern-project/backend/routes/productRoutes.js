const express = require("express");
const router = express.Router();
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
 * GET    /api/products      - Get all products
 * GET    /api/products/:id  - Get a single product by ID
 * POST   /api/products      - Create a new product
 * PUT    /api/products/:id  - Update a product by ID
 * DELETE /api/products/:id  - Delete a product by ID
 */

router.route("/").get(getAllProducts).post(createProduct);

router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;
