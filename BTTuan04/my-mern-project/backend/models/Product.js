const mongoose = require("mongoose");

/**
 * Product Schema — Extended for E-Commerce Electronics Store
 * Supports: multiple images, category, stock, sold tracking,
 * discount pricing, new arrivals flag, and tags.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
    },
    // Sale price (displayed price)
    price: {
      type: Number,
      required: [true, "Giá sản phẩm là bắt buộc"],
      min: [0, "Giá không được âm"],
    },
    // Original price before discount
    originalPrice: {
      type: Number,
      default: null,
    },
    // Discount percentage (0-100)
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Multiple product images (first image = main display)
    images: {
      type: [String],
      default: [],
    },
    // Legacy single image — kept for backwards compat
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Reference to Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    // Inventory
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Total units sold
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Mark as new arrival
    isNew: {
      type: Boolean,
      default: false,
    },
    // Tags for filtering (e.g. ["gaming", "wireless", "apple"])
    tags: {
      type: [String],
      default: [],
    },
    // Detailed specs as key-value pairs
    specs: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
