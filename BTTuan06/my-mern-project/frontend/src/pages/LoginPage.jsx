import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const { isAuthenticated } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">TechStore</h1>
          <p className="text-primary-200 text-lg max-w-xs leading-relaxed">
            Thiết bị công nghệ cao cấp — Chính hãng · Bảo hành toàn quốc
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: '10K+', label: 'Sản phẩm' },
              { value: '50K+', label: 'Khách hàng' },
              { value: '99%', label: 'Hài lòng' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-primary-300 text-xs mt-1">{s.label}</div>
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

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại! 👋</h2>
          <p className="text-gray-500 mb-8">Đăng nhập để khám phá thế giới công nghệ</p>

          {/* Error alert */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span className="text-red-500">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
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

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">🔑 Tài khoản demo:</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Admin: <span className="font-mono bg-white px-1.5 py-0.5 rounded border">admin@techstore.vn</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">Admin@123</span></p>
              <p className="text-xs text-gray-600">Member: <span className="font-mono bg-white px-1.5 py-0.5 rounded border">member@techstore.vn</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border">Member@123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
