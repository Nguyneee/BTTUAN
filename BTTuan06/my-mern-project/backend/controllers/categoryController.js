const Category = require('../models/Category');
const { AppError } = require('../shared/errors/AppError');
const { ApiResponse } = require('../shared/utils/apiResponse');

/**
 * @desc   Get all categories
 * @route  GET /api/categories
 * @access Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(ApiResponse.success(categories, 'Lấy danh mục thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get single category by ID
 * @route  GET /api/categories/:id
 * @access Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Danh mục không tồn tại', 404));
    res.status(200).json(ApiResponse.success(category));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Create a new category
 * @route  POST /api/categories
 * @access Private (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl, icon } = req.body;
    if (!name || !slug) return next(new AppError('Tên và slug là bắt buộc', 400));

    const category = await Category.create({ name, slug, description, imageUrl, icon });
    res.status(201).json(ApiResponse.success(category, 'Tạo danh mục thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update a category
 * @route  PUT /api/categories/:id
 * @access Private (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return next(new AppError('Danh mục không tồn tại', 404));
    res.status(200).json(ApiResponse.success(category, 'Cập nhật thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Delete a category
 * @route  DELETE /api/categories/:id
 * @access Private (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Danh mục không tồn tại', 404));
    res.status(200).json(ApiResponse.success(null, 'Xóa danh mục thành công'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
