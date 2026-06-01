const mongoose = require('mongoose');

const { Schema } = mongoose;

// Order status constants
const ORDER_STATUS = {
  PENDING: 'PENDING',           // 1. Don hang moi
  CONFIRMED: 'CONFIRMED',      // 2. Da xac nhan
  PROCESSING: 'PROCESSING',    // 3. Shop dang chuan bi hang
  SHIPPING: 'SHIPPING',        // 4. Dang giao hang
  DELIVERED: 'DELIVERED',      // 5. Da giao thanh cong
  CANCELLED: 'CANCELLED',      // 6. Huy don hang
  CANCEL_REQUESTED: 'CANCEL_REQUESTED', // Yeu cau huy (khi PROCESSING)
};

// Valid status transitions
const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCEL_REQUESTED],
  [ORDER_STATUS.CANCEL_REQUESTED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

/**
 * StatusHistory — tracks status changes
 */
const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(ORDER_STATUS),
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

/**
 * OrderItem — snapshot of cart item at order time
 */
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    image: String,
    price: Number,
    originalPrice: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/**
 * ShippingAddress Schema
 */
const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên người nhận là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Địa chỉ là bắt buộc'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Thành phố là bắt buộc'],
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Order Schema
 */
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderCode: {
      type: String,
      unique: true,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: ORDER_STATUS.PENDING, timestamp: new Date(), note: 'Đơn hàng được tạo' }],
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
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

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
// orderCode already has unique:true in schema, no separate index needed
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate unique order code
orderSchema.statics.generateOrderCode = async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  const code = `TS${year}${month}${day}${random}`;

  const exists = await this.findOne({ orderCode: code });
  if (exists) {
    return this.generateOrderCode();
  }
  return code;
};

// Add status history entry
orderSchema.methods.addStatusHistory = function (status, note = '', changedBy = null) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
    changedBy,
  });
  this.status = status;
};

// Check if transition is valid
orderSchema.statics.isValidTransition = function (fromStatus, toStatus) {
  const allowed = STATUS_TRANSITIONS[fromStatus];
  return allowed && allowed.includes(toStatus);
};

// Static: get all valid statuses
orderSchema.statics.getAllStatuses = function () {
  return ORDER_STATUS;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order, ORDER_STATUS, STATUS_TRANSITIONS };
