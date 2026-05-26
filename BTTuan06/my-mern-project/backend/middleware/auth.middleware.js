const { verifyAccessToken } = require('../shared/utils/jwt');
const { AppError } = require('../shared/errors/AppError');
const User = require('../models/User');

/**
 * authenticate — Verify JWT access token from Authorization header.
 * Attaches `req.user` on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Không có token xác thực', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).select('-password -refreshToken');
    if (!user) {
      return next(new AppError('Người dùng không tồn tại', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize — Role-based access control.
 * Call after authenticate middleware.
 * @param {...string} roles — Allowed roles, e.g. authorize('admin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
  }
  next();
};

module.exports = { authenticate, authorize };
