const { Order, ORDER_STATUS, STATUS_TRANSITIONS } = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');
const {
  createAndSendNotification,
  createAndSendAdminNotification,
} = require('./notificationController');
const { NOTIFICATION_TYPES } = require('../models/Notification');
const { validateCoupon, calcDiscount } = require('./couponController');

// Shipping fee constants
const SHIPPING_FEE = 30000; // 30,000 VND
const FREE_SHIPPING_THRESHOLD = 500000; // Free shipping for orders >= 500,000 VND

// 30-minute window in ms
const CANCEL_WINDOW_MS = 30 * 60 * 1000;

/**
 * Create order from cart (COD)
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, note, couponCode } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return next(new AppError('Vui lòng điền đầy đủ thông tin giao hàng', 400));
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price originalPrice discount images imageUrl stock',
    });

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Giỏ hàng trống', 400));
    }

    // Filter valid items (product still exists)
    const validItems = cart.items.filter((item) => item.product != null);
    if (validItems.length === 0) {
      return next(new AppError('Không có sản phẩm hợp lệ trong giỏ hàng', 400));
    }

    // Validate stock for each item
    for (const item of validItems) {
      if (item.quantity > item.product.stock) {
        return next(
          new AppError(
            `Sản phẩm "${item.product.name}" chỉ còn ${item.product.stock} trong kho`,
            400
          )
        );
      }
    }

    // Calculate totals
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    // Process Coupon if provided
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await validateCoupon(couponCode, userId, subtotal);
      discountAmount = calcDiscount(coupon, subtotal);
    }
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    // Build order items (snapshot)
    const orderItems = validItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || item.product.imageUrl || '',
      price: item.product.price,
      originalPrice: item.product.originalPrice || null,
      quantity: item.quantity,
    }));

    // Generate order code
    const orderCode = await Order.generateOrderCode();

    // Create order
    const order = new Order({
      user: userId,
      orderCode,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'COD',
      paymentStatus: 'UNPAID',
      subtotal,
      shippingFee,
      totalAmount,
      status: ORDER_STATUS.PENDING,
      note: note || '',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      coupon: coupon ? coupon._id : null,
      couponCode: coupon ? coupon.code : null,
      discountAmount,
    });

    await order.save();

    // Mark coupon as used
    if (coupon) {
      coupon.usageCount += 1;
      coupon.usedBy.push(userId);
      await coupon.save();
    }

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    // Decrement stock and increment sold
    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    await order.populate('user', 'username email');

    // ── Thông báo admin: có đơn hàng mới ──────────────────────────────────
    createAndSendAdminNotification({
      type: NOTIFICATION_TYPES.ORDER_NEW,
      title: '🛒 Đơn hàng mới!',
      message: `Có đơn hàng mới #${order.orderCode} từ khách hàng ${order.user.username}. Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')} VND`,
      data: { orderId: order._id, orderCode: order.orderCode },
      sendEmail: true,
    }).catch(console.error);

    return res.status(201).json(
      ApiResponse.success(order, 'Đặt hàng thành công! Cảm ơn bạn đã đặt hàng tại TechStore.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders (paginated)
 * GET /api/orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { user: userId };
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username email'),
      Order.countDocuments(query),
    ]);

    return res.status(200).json(
      ApiResponse.paginated(orders, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order detail
 * GET /api/orders/:id
 */
const getOrderDetail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId }).populate(
      'user',
      'username email'
    );

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    return res.status(200).json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order (user cancel - only within 30 minutes)
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    // Only PENDING or CONFIRMED orders can be directly cancelled
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status)) {
      return next(
        new AppError(
          'Không thể hủy đơn hàng ở trạng thái này. Vui lòng liên hệ shop.',
          400
        )
      );
    }

    // If PENDING, only allow cancel within 30 minutes
    if (order.status === ORDER_STATUS.PENDING) {
      const timePassed = Date.now() - new Date(order.createdAt).getTime();
      if (timePassed > CANCEL_WINDOW_MS) {
        return next(
          new AppError(
            'Đã quá thời hạn hủy đơn (30 phút). Đơn hàng đã được xác nhận tự động.',
            400
          )
        );
      }
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    // Update order status
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelReason = reason || 'Khách hàng hủy đơn';
    order.paymentStatus = 'REFUNDED';
    order.addStatusHistory(
      ORDER_STATUS.CANCELLED,
      reason || 'Khách hàng hủy đơn',
      userId
    );

    await order.save();

    return res.status(200).json(
      ApiResponse.success(order, 'Đơn hàng đã được hủy thành công')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Request cancel order (when order is PROCESSING)
 * PUT /api/orders/:id/request-cancel
 */
const requestCancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    if (order.status !== ORDER_STATUS.PROCESSING) {
      return next(
        new AppError(
          'Chỉ có thể yêu cầu hủy khi đơn hàng đang được chuẩn bị',
          400
        )
      );
    }

    order.status = ORDER_STATUS.CANCEL_REQUESTED;
    order.cancelReason = reason || 'Khách hàng yêu cầu hủy';
    order.addStatusHistory(
      ORDER_STATUS.CANCEL_REQUESTED,
      reason || 'Khách hàng yêu cầu hủy đơn',
      userId
    );

    await order.save();

    return res.status(200).json(
      ApiResponse.success(
        order,
        'Yêu cầu hủy đơn đã được gửi. Shop sẽ xem xét trong thời gian sớm nhất.'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ============ ADMIN ROUTES ============

/**
 * Get all orders (admin) - paginated
 * GET /api/orders/admin/all
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username email'),
      Order.countDocuments(query),
    ]);

    return res.status(200).json(
      ApiResponse.paginated(orders, {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order (admin)
 * GET /api/orders/admin/:id
 */
const getAdminOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('user', 'username email');

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    return res.status(200).json(ApiResponse.success(order));
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin)
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { status: newStatus, note } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    // Validate transition
    if (!Order.isValidTransition(order.status, newStatus)) {
      return next(
        new AppError(
          `Không thể chuyển từ trạng thái "${order.status}" sang "${newStatus}"`,
          400
        )
      );
    }

    // If cancelling (admin cancel), restore stock
    if (newStatus === ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
      order.paymentStatus = 'REFUNDED';
    }

    // If delivered (COD collected)
    if (newStatus === ORDER_STATUS.DELIVERED) {
      order.paymentStatus = 'PAID';
    }

    order.addStatusHistory(newStatus, note || `Admin cập nhật trạng thái`, adminId);
    order.status = newStatus;

    await order.save();
    await order.populate('user', 'username email');

    // ── Thông báo user: trạng thái đơn thay đổi ───────────────────────────
    const statusLabels = {
      CONFIRMED: 'đã được xác nhận ✅',
      PROCESSING: 'đang được chuẩn bị 📦',
      SHIPPING: 'đang trên đường giao 🚚',
      DELIVERED: 'đã giao thành công 🎉',
      CANCELLED: 'đã bị hủy ❌',
      CANCEL_REQUESTED: 'đang chờ xử lý yêu cầu hủy ⏳',
    };
    const statusLabel = statusLabels[newStatus] || newStatus;
    createAndSendNotification({
      userId: order.user._id,
      type: NOTIFICATION_TYPES.ORDER_STATUS_CHANGED,
      title: `Cập nhật đơn hàng #${order.orderCode}`,
      message: `Đơn hàng #${order.orderCode} của bạn ${statusLabel}.${note ? ' Ghi chú: ' + note : ''}`,
      data: { orderId: order._id, orderCode: order.orderCode, newStatus },
      sendEmail: true,
    }).catch(console.error);

    return res.status(200).json(
      ApiResponse.success(order, `Trạng thái đơn hàng đã được cập nhật`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics (admin)
 * GET /api/orders/admin/stats
 */
const getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, pending, processing, shipping, delivered, cancelled, todayOrders] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: ORDER_STATUS.PENDING }),
        Order.countDocuments({ status: ORDER_STATUS.PROCESSING }),
        Order.countDocuments({ status: ORDER_STATUS.SHIPPING }),
        Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
        Order.countDocuments({ createdAt: { $gte: today } }),
      ]);

    // Revenue (delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: ORDER_STATUS.DELIVERED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    return res.status(200).json(
      ApiResponse.success({
        total,
        pending,
        processing,
        shipping,
        delivered,
        cancelled,
        todayOrders,
        totalRevenue,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  requestCancelOrder,
  getAllOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  getOrderStats,
};
