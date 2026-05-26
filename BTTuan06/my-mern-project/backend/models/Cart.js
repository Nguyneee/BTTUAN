const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * CartItem Schema — item within a cart
 */
const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Số lượng phải ít nhất 1'],
      default: 1,
    },
  },
  { _id: false }
);

/**
 * Cart Schema — one cart per user, stored in MongoDB
 */
const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
