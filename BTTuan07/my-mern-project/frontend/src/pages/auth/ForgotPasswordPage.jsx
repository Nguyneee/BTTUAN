import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/auth.api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: success
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.forgotPassword({ email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 relative overflow-hidden flex-col items-center justify-center p-12">
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
          <h1 className="text-4xl font-black mb-4">TechStore</h1>
          <p className="text-primary-200 text-lg max-w-xs leading-relaxed">
            Khôi phục quyền truy cập tài khoản của bạn một cách an toàn
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Back button */}
          <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại đăng nhập</span>
          </Link>

          {step === 1 ? (
            <>
              <div className="mb-2">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
                <p className="text-gray-500">
                  Nhập email của bạn và chúng tôi sẽ gửi mã OTP để khôi phục mật khẩu.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmitEmail} className="space-y-5 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ban@example.com"
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi mã OTP...
                    </>
                  ) : (
                    'Gửi mã OTP'
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Nhớ mật khẩu rồi?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Đã gửi mã OTP!</h2>
                <p className="text-gray-500 mb-6">
                  Chúng tôi đã gửi mã xác thực 6 chữ số đến email <strong className="text-gray-700">{email}</strong>
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Kiểm tra hộp thư spam nếu không thấy email.
                </p>
              </div>

              <div className="space-y-4">
                <Link to="/reset-password" state={{ email }} className="btn-primary w-full block text-center">
                  Tiếp tục đặt lại mật khẩu
                </Link>
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary w-full"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
