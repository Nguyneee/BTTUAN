import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';
import OtpInput from '../components/auth/OtpInput';

export default function RegisterPage() {
  const { register, verifyOtp, resendOtp, loading, error, clearError } = useAuth();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: register form, 2: OTP verification
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [emailForOtp, setEmailForOtp] = useState('');
  const countdownRef = useRef(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [countdown]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setFormError(null);
    if (error) clearError();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    
    setFormError(null);
    try {
      await register({ email: form.email, username: form.username, password: form.password });
      setEmailForOtp(form.email);
      setStep(2);
      setCountdown(300); // 5 minutes
      setSuccess('Đăng ký thành công! Vui lòng nhập mã OTP đã gửi đến email của bạn.');
    } catch {
      // Error handled in hook
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      await verifyOtp({ email: emailForOtp, otp }, navigate);
    } catch {
      // Error handled in hook
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email: emailForOtp });
      setCountdown(300);
      setSuccess('Mã OTP mới đã được gửi!');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    setStep(1);
    setSuccess(null);
    setFormError(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-4">TechStore</h1>
          <p className="text-primary-200 text-lg max-w-xs leading-relaxed">
            Tham gia cộng đồng TechStore — Mua sắm thông minh, ưu đãi độc quyền
          </p>
          <div className="mt-10 space-y-3">
            {['✅ Chính hãng 100%', '🚀 Giao hàng nhanh', '🛡️ Bảo hành chính hãng', '💎 Ưu đãi thành viên'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-primary-100 text-sm">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">TechStore</span>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản 🎉</h2>
              <p className="text-gray-500 mb-8">Đăng ký miễn phí, nhận ngay ưu đãi chào mừng</p>

              {(formError || error) && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠</span> {formError || error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="ban@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-username"
                      name="username"
                      type="text"
                      placeholder="ten_dang_nhap"
                      value={form.username}
                      onChange={handleChange}
                      required
                      minLength={3}
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Ít nhất 6 ký tự"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="input-field pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`input-field pl-11 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>

              <div className="mb-2">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Xác thực tài khoản</h2>
                <p className="text-gray-500">
                  Mã OTP đã gửi đến <strong className="text-gray-700">{emailForOtp}</strong>
                </p>
              </div>

              {success && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              {(formError || error) && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠</span> {formError || error}
                </div>
              )}

              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                    Nhập mã OTP (6 chữ số)
                  </label>
                  <OtpInput length={6} onComplete={handleVerifyOtp} disabled={loading} />
                </div>

                {countdown > 0 && (
                  <p className="text-center text-sm text-gray-400">
                    Mã có hiệu lực trong: <span className="font-mono text-primary-600 font-semibold">{formatTime(countdown)}</span>
                  </p>
                )}

                <div className="text-center">
                  {countdown === 0 ? (
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Gửi lại mã OTP
                    </button>
                  ) : (
                    <p className="text-gray-400 text-sm">Không nhận được mã? Vui lòng chờ</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
