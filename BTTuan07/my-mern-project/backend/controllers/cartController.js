const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');

/**
 * Get current user's cart
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price originalPrice discount images imageUrl stock category',
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Filter out items where product was deleted
    const validItems = cart.items.filter((item) => item.product != null);

    // Calculate cart totals
    const subtotal = validItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const cartCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json(
      ApiResponse.success({
        ...cart.toObject(),
        items: validItems,
        subtotal,
        cartCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 * Body: { productId, quantity }
 */
const addItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(new AppError('ID sản phẩm là bắt buộc', 400));
    }

    if (quantity < 1) {
      return next(new AppError('Số lượng phải ít nhất 1', 400));
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Sản phẩm không tồn tại', 404));
    }

    if (product.stock < quantity) {
      return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400));
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400));
      }
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images imageUrl stock category',
    });

    const validItems = cart.items.filter((item) => item.product != null);
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const cartCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json(
      ApiResponse.success({
        ...cart.toObject(),
        items: validItems,
        subtotal,
        cartCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update item quantity in cart
 * PUT /api/cart/items/:productId
 * Body: { quantity }
 */
const updateItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return next(new AppError('Số lượng phải ít nhất 1', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Sản phẩm không tồn tại', 404));
    }

    if (quantity > product.stock) {
      return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Giỏ hàng trống', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new AppError('Sản phẩm không có trong giỏ hàng', 404));
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images imageUrl stock category',
    });

    const validItems = cart.items.filter((item) => item.product != null);
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const cartCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json(
      ApiResponse.success({
        ...cart.toObject(),
        items: validItems,
        subtotal,
        cartCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
const removeItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Giỏ hàng trống', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new AppError('Sản phẩm không có trong giỏ hàng', 404));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images imageUrl stock category',
    });

    const validItems = cart.items.filter((item) => item.product != null);
    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const cartCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json(
      ApiResponse.success({
        ...cart.toObject(),
        items: validItems,
        subtotal,
        cartCount,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true, upsert: true });

    return res.status(200).json(
      ApiResponse.success({
        _id: null,
        user: userId,
        items: [],
        subtotal: 0,
        cartCount: 0,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
