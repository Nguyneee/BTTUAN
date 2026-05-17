const Product = require("../models/Product");
const { ApiResponse } = require("../shared/utils/apiResponse");
const { AppError } = require("../shared/errors/AppError");

/**
 * @desc   Get all products with filtering, searching, sorting, and pagination
 * @route  GET /api/products
 * @access Public
 * @query  search, category, minPrice, maxPrice, inStock, onSale, isNew, tags, sort, page, limit
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      isNew,
      tags,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Category filter
    if (category) filter.category = category;

    // Price range filter (use price = sale price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // In stock filter
    if (inStock === "true") filter.stock = { $gt: 0 };

    // On sale filter (has discount)
    if (onSale === "true") filter.discount = { $gt: 0 };

    // New arrivals filter
    if (isNew === "true") filter.isNew = true;

    // Tags filter (comma-separated)
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagList };
    }

    // Sort options
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      best_seller: { sold: -1 },
      name_asc: { name: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug icon")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(
      ApiResponse.paginated(products, {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      })
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get a single product by ID + similar products
 * @route  GET /api/products/:id
 * @access Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug icon"
    );

    if (!product) return next(new AppError("Sản phẩm không tồn tại", 404));

    // Similar products: same category, different ID, limit 8
    let similarProducts = [];
    if (product.category) {
      similarProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
      })
        .populate("category", "name slug icon")
        .sort({ sold: -1 })
        .limit(8);
    }

    res
      .status(200)
      .json(ApiResponse.success({ product, similarProducts }, "Lấy sản phẩm thành công"));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Create a new product
 * @route  POST /api/products
 * @access Private (Admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name, price, originalPrice, discount, description,
      images, imageUrl, category, stock, isNew, tags, specs,
    } = req.body;

    if (!name || price === undefined) {
      return next(new AppError("Tên và giá sản phẩm là bắt buộc", 400));
    }

    const product = await Product.create({
      name, price, originalPrice, discount, description,
      images: images || (imageUrl ? [imageUrl] : []),
      imageUrl,
      category,
      stock: stock || 0,
      sold: 0,
      isNew: isNew || false,
      tags: tags || [],
      specs: specs || {},
    });

    const populated = await product.populate("category", "name slug icon");
    res.status(201).json(ApiResponse.success(populated, "Tạo sản phẩm thành công"));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update an existing product
 * @route  PUT /api/products/:id
 * @access Private (Admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug icon");

    if (!product) return next(new AppError("Sản phẩm không tồn tại", 404));

    res.status(200).json(ApiResponse.success(product, "Cập nhật sản phẩm thành công"));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete a product
 * @route  DELETE /api/products/:id
 * @access Private (Admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Sản phẩm không tồn tại", 404));

    res
      .status(200)
      .json(ApiResponse.success({ id: req.params.id }, "Xóa sản phẩm thành công"));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
