const mongoose = require('mongoose');

/**
 * Category Schema
 * Represents product categories (e.g., Điện thoại, Laptop, Tai nghe...)
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📦',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
