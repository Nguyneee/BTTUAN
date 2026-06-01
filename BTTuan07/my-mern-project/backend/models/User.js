const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

/**
 * User Schema
 * Adapted from BTTuan02 — simplified: no Redis, no OAuth, roles: member/admin
 */
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên đăng nhập phải ít nhất 3 ký tự'],
      maxlength: [30, 'Tên đăng nhập không quá 30 ký tự'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải ít nhất 6 ký tự'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    avatar: {
      type: String,
      default: null,
    },
    // Store refresh token in DB (no Redis needed)
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // OTP verification for registration
    isActivated: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      default: null,
      select: false,
    },
    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // OTP for password reset
    resetPasswordOtp: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // Điểm tích lũy (tặng khi đánh giá sản phẩm)
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Lịch sử điểm
    pointsHistory: {
      type: [
        {
          amount: Number,
          type: { type: String, enum: ['EARN', 'SPEND'] },
          reason: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare plain password with hash
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Return safe public profile object
UserSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    role: this.role,
    avatar: this.avatar,
    isActivated: this.isActivated,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

// Static finder by email (include password for comparison)
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select('+password +refreshToken +otpCode +otpExpires +resetPasswordOtp +resetPasswordExpires');
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
