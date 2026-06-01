const Wishlist = require('../models/Wishlist');
const ViewHistory = require('../models/ViewHistory');
const Product = require('../models/Product');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');

// ─────────────────────────── WISHLIST ──────────────────────────────────────

/**
 * GET /api/wishlist
 * Lấy danh sách yêu thích của user
 */
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name price salePrice images imageUrl averageRating reviewCount stock sold category',
        populate: { path: 'category', select: 'name' },
      });

    if (!wishlist) {
      return res.status(200).json(ApiResponse.success({ products: [], total: 0 }));
    }

    // Lọc bỏ product đã bị xóa (null)
    const validProducts = wishlist.products
      .filter((p) => p.product != null)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return res.status(200).json(
      ApiResponse.success({ products: validProducts, total: validProducts.length })
    );
  } catch (error) { next(error); }
};

/**
 * POST /api/wishlist/toggle/:productId
 * Toggle sản phẩm vào/ra danh sách yêu thích
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId).select('name');
    if (!product) return next(new AppError('Sản phẩm không tồn tại', 404));

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const existingIdx = wishlist.products.findIndex(
      (p) => p.product.toString() === productId
    );

    let added;
    if (existingIdx > -1) {
      // Đã có → xóa
      wishlist.products.splice(existingIdx, 1);
      added = false;
    } else {
      // Chưa có → thêm
      wishlist.products.push({ product: productId, addedAt: new Date() });
      added = true;
    }

    await wishlist.save();

    return res.status(200).json(
      ApiResponse.success(
        { added, productId, total: wishlist.products.length },
        added ? `Đã thêm "${product.name}" vào yêu thích ❤️` : `Đã xóa khỏi yêu thích`
      )
    );
  } catch (error) { next(error); }
};

/**
 * GET /api/wishlist/check/:productId
 * Kiểm tra sản phẩm có trong wishlist không
 */
const checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const isWishlisted = wishlist?.products.some(
      (p) => p.product.toString() === productId
    ) || false;
    return res.status(200).json(ApiResponse.success({ isWishlisted }));
  } catch (error) { next(error); }
};

/**
 * DELETE /api/wishlist/clear
 * Xóa tất cả sản phẩm yêu thích
 */
const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { products: [] },
      { upsert: true }
    );
    return res.status(200).json(ApiResponse.success(null, 'Đã xóa tất cả sản phẩm yêu thích'));
  } catch (error) { next(error); }
};

// ─────────────────────────── VIEW HISTORY ──────────────────────────────────

/**
 * POST /api/wishlist/history/:productId
 * Ghi nhận lượt xem sản phẩm (gọi khi vào trang chi tiết)
 */
const recordView = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Tăng viewCount trên Product
    await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });

    // Cập nhật lịch sử xem của user
    let history = await ViewHistory.findOne({ user: userId });
    if (!history) {
      history = new ViewHistory({ user: userId, products: [] });
    }

    const existingIdx = history.products.findIndex(
      (p) => p.product.toString() === productId
    );

    if (existingIdx > -1) {
      // Đã xem trước → cập nhật viewedAt và count, move to end
      const [item] = history.products.splice(existingIdx, 1);
      item.viewedAt = new Date();
      item.viewCount += 1;
      history.products.push(item);
    } else {
      history.products.push({ product: productId, viewedAt: new Date(), viewCount: 1 });
    }

    await history.save();

    return res.status(200).json(ApiResponse.success({ recorded: true }));
  } catch (error) { next(error); }
};

/**
 * GET /api/wishlist/history
 * Lịch sử xem sản phẩm (50 gần nhất, mới nhất trước)
 */
const getViewHistory = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const history = await ViewHistory.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name price salePrice images imageUrl averageRating reviewCount stock sold',
      });

    if (!history) {
      return res.status(200).json(ApiResponse.success({ products: [], total: 0 }));
    }

    const validProducts = history.products
      .filter((p) => p.product != null)
      .slice()
      .reverse()
      .slice(0, parseInt(limit));

    return res.status(200).json(
      ApiResponse.success({ products: validProducts, total: validProducts.length })
    );
  } catch (error) { next(error); }
};

/**
 * DELETE /api/wishlist/history
 * Xóa lịch sử xem
 */
const clearViewHistory = async (req, res, next) => {
  try {
    await ViewHistory.findOneAndUpdate(
      { user: req.user._id },
      { products: [] },
      { upsert: true }
    );
    return res.status(200).json(ApiResponse.success(null, 'Đã xóa lịch sử xem'));
  } catch (error) { next(error); }
};

module.exports = {
  getWishlist, toggleWishlist, checkWishlist, clearWishlist,
  recordView, getViewHistory, clearViewHistory,
};
