import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, User, FileText, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { orderAPI } from '../api/order.api';

const SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 500000;

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, cartCount, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    note: '',
  });

  const [errors, setErrors] = useState({});

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[0-9]{9,10})$/.test(form.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!form.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!form.city.trim()) newErrors.city = 'Vui lòng nhập thành phố';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const res = await orderAPI.createOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
        },
        note: form.note.trim(),
      });

      // Refresh cart to show empty
      await fetchCart();

      // Navigate to success page
      navigate(`/order-success/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào để thanh toán.</p>
          <Link to="/" className="btn-primary inline-flex">Tiếp tục mua sắm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Địa chỉ giao hàng
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        Họ tên người nhận <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nguyen Van A"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        Số điện thoại <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="TP. Hồ Chí Minh"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="123 Đường ABC, Phường XYZ, Quận 1"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  {/* Note */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        Ghi chú (tùy chọn)
                      </span>
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4">Phương thức thanh toán</h2>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Bạn thanh toán bằng tiền mặt khi nhận được sản phẩm
                    </p>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary-600" />
                  Đơn hàng ({cartCount})
                </h3>

                {/* Items */}
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => {
                    if (!item.product) return null;
                    return (
                      <div key={item.product._id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                          <img
                            src={item.product.images?.[0] || item.product.imageUrl || ''}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                            {item.product.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-sm font-bold text-primary-700">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-emerald-600">
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-primary-600 bg-primary-50 rounded-lg p-2">
                      Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để miễn phí ship!
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <span className="font-black text-primary-700 text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-5 btn-primary py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Xác nhận đặt hàng
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <span className="text-primary-600 cursor-pointer">Điều khoản dịch vụ</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
