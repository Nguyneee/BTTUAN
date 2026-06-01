const { Coupon, COUPON_TYPES } = require('../models/Coupon');
const User = require('../models/User');
const { ApiResponse } = require('../shared/utils/apiResponse');
const { AppError } = require('../shared/errors/AppError');

// ─── Helper: tính giá trị giảm ───────────────────────────────────────────
function calcDiscount(coupon, orderTotal) {
  if (coupon.type === COUPON_TYPES.PERCENT) {
    const raw = (orderTotal * coupon.value) / 100;
    return coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
  }
  return Math.min(coupon.value, orderTotal); // FIXED không vượt orderTotal
}

// ─── Helper: validate coupon cho user ────────────────────────────────────
async function validateCoupon(code, userId, orderTotal) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) throw new AppError('Mã giảm giá không tồn tại', 404);
  if (!coupon.isActive) throw new AppError('Mã giảm giá đã bị vô hiệu hóa', 400);

  const now = new Date();
  if (now < coupon.startDate) throw new AppError('Mã giảm giá chưa có hiệu lực', 400);
  if (now > coupon.endDate) throw new AppError('Mã giảm giá đã hết hạn', 400);
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
    throw new AppError('Mã giảm giá đã được sử dụng hết', 400);
  if (coupon.targetUser && coupon.targetUser.toString() !== userId.toString())
    throw new AppError('Mã giảm giá không áp dụng cho tài khoản này', 403);
  if (orderTotal < coupon.minOrderAmount)
    throw new AppError(`Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')} VND để dùng mã này`, 400);

  // Kiểm tra limit per user
  const userUsedCount = coupon.usedBy.filter((u) => u.toString() === userId.toString()).length;
  if (userUsedCount >= (coupon.usageLimitPerUser || 1))
    throw new AppError('Bạn đã sử dụng mã giảm giá này rồi', 400);

  return coupon;
}

// ─── User APIs ────────────────────────────────────────────────────────────

/**
 * POST /api/coupons/validate
 * Kiểm tra & tính số tiền giảm
 */
const validateCouponAPI = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code || !orderTotal) return next(new AppError('code và orderTotal là bắt buộc', 400));

    const coupon = await validateCoupon(code, req.user._id, orderTotal);
    const discountAmount = calcDiscount(coupon, orderTotal);

    return res.status(200).json(
      ApiResponse.success({
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          maxDiscountAmount: coupon.maxDiscountAmount,
        },
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.round(orderTotal - discountAmount),
      }, `Áp dụng mã "${coupon.code}" thành công! Giảm ${Math.round(discountAmount).toLocaleString('vi-VN')} VND`)
    );
  } catch (error) { next(error); }
};

/**
 * GET /api/coupons/my
 * Coupon dành riêng cho user (targetUser = me) + coupon public còn hạn
 */
const getMyCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { targetUser: null },
        { targetUser: req.user._id },
      ],
    }).sort({ endDate: 1 });

    // Lọc bỏ coupon user đã dùng hết lượt
    const filtered = coupons.filter((c) => {
      const userUsed = c.usedBy.filter((u) => u.toString() === req.user._id.toString()).length;
      return userUsed < (c.usageLimitPerUser || 1);
    });

    return res.status(200).json(ApiResponse.success(filtered));
  } catch (error) { next(error); }
};

// ─── Admin APIs ───────────────────────────────────────────────────────────

/**
 * GET /api/coupons (admin)
 * Danh sách tất cả coupon
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (search) query.code = { $regex: search.toUpperCase(), $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Coupon.countDocuments(query),
    ]);

    return res.status(200).json(ApiResponse.paginated(coupons, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    }));
  } catch (error) { next(error); }
};

/**
 * POST /api/coupons (admin)
 * Tạo coupon mới
 */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code, description, type, value, minOrderAmount,
      maxDiscountAmount, usageLimit, usageLimitPerUser,
      startDate, endDate, isActive, targetUser,
    } = req.body;

    if (!code || !type || value === undefined || !endDate)
      return next(new AppError('code, type, value, endDate là bắt buộc', 400));
    if (!Object.values(COUPON_TYPES).includes(type))
      return next(new AppError(`type phải là ${Object.values(COUPON_TYPES).join(' hoặc ')}`, 400));
    if (type === COUPON_TYPES.PERCENT && (value < 1 || value > 100))
      return next(new AppError('Phần trăm giảm phải từ 1-100', 400));

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description, type, value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      usageLimitPerUser: usageLimitPerUser || 1,
      startDate: startDate || new Date(),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? isActive : true,
      targetUser: targetUser || null,
      createdBy: 'admin',
    });

    return res.status(201).json(ApiResponse.success(coupon, 'Tạo mã giảm giá thành công'));
  } catch (error) {
    if (error.code === 11000) return next(new AppError('Mã coupon đã tồn tại', 400));
    next(error);
  }
};

/**
 * PUT /api/coupons/:id (admin)
 * Cập nhật coupon
 */
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return next(new AppError('Mã giảm giá không tồn tại', 404));
    return res.status(200).json(ApiResponse.success(coupon, 'Cập nhật thành công'));
  } catch (error) { next(error); }
};

/**
 * DELETE /api/coupons/:id (admin)
 * Xóa coupon
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError('Mã giảm giá không tồn tại', 404));
    return res.status(200).json(ApiResponse.success(null, 'Đã xóa mã giảm giá'));
  } catch (error) { next(error); }
};

/**
 * PATCH /api/coupons/:id/toggle (admin)
 * Bật/tắt coupon
 */
const toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return next(new AppError('Mã giảm giá không tồn tại', 404));
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return res.status(200).json(
      ApiResponse.success(coupon, coupon.isActive ? 'Đã bật mã giảm giá' : 'Đã tắt mã giảm giá')
    );
  } catch (error) { next(error); }
};

/**
 * POST /api/coupons/exchange-points
 * Đổi điểm loyalty lấy coupon
 */
const exchangePointsToCoupon = async (req, res, next) => {
  try {
    const { option } = req.body; // '500' | '1000' | '2000'
    const userId = req.user._id;

    const options = {
      '500': { points: 500, value: 50000, desc: 'Voucher 50K từ đổi điểm tích luỹ' },
      '1000': { points: 1000, value: 120000, desc: 'Voucher 120K từ đổi điểm tích luỹ' },
      '2000': { points: 2000, value: 250000, desc: 'Voucher 250K từ đổi điểm tích luỹ' },
    };

    const opt = options[option];
    if (!opt) return next(new AppError('Gói đổi điểm không hợp lệ', 400));

    const user = await User.findById(userId).select('+pointsHistory loyaltyPoints');
    if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

    if (user.loyaltyPoints < opt.points) {
      return next(new AppError(`Bạn không đủ điểm. Cần ${opt.points} điểm, hiện có ${user.loyaltyPoints} điểm.`, 400));
    }

    // Generate unique code LTY-[RANDOM]
    const randomCode = 'LTY-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create coupon
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration

    const coupon = await Coupon.create({
      code: randomCode,
      description: opt.desc,
      type: COUPON_TYPES.FIXED,
      value: opt.value,
      minOrderAmount: opt.value * 1.5, // minimum order value is 1.5x voucher value to prevent abuse
      usageLimit: 1,
      usageLimitPerUser: 1,
      startDate: new Date(),
      endDate: expirationDate,
      isActive: true,
      targetUser: userId,
      createdBy: 'system',
    });

    // Deduct points
    user.loyaltyPoints -= opt.points;
    user.pointsHistory.push({
      amount: opt.points,
      type: 'SPEND',
      reason: `Đổi mã giảm giá ${randomCode}`,
    });
    await user.save();

    return res.status(200).json(
      ApiResponse.success(
        { coupon, currentPoints: user.loyaltyPoints },
        `Đổi mã giảm giá thành công! Nhận mã ${randomCode} giảm ${opt.value.toLocaleString('vi-VN')} VND`
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCouponAPI, getMyCoupons,
  getAllCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon,
  exchangePointsToCoupon,
  validateCoupon, calcDiscount, // export for order controller
};
