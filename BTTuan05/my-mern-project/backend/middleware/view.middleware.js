const Product = require("../models/Product");

/**
 * @desc   Increment viewCount when a product is viewed
 * @route  Applied to GET /api/products/:id
 */
const incrementViewCount = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  } catch (err) {
    // Silently fail - view tracking should not break the request
    console.error("Failed to increment viewCount:", err.message);
  }
  next();
};

module.exports = { incrementViewCount };
