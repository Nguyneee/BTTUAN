import { Link, useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Gift, ShoppingBag } from 'lucide-react';

const SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 500000;

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartSummary({ subtotal, cartCount, items }) {
  const navigate = useNavigate();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const isEmpty = !items || items.length === 0;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 text-base mb-4">Tổng quan đơn hàng</h3>

        {/* Line items */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Số lượng sản phẩm</span>
            <span className="font-semibold text-gray-900">{cartCount} sản phẩm</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Phí vận chuyển
            </span>
            <span className="font-semibold text-gray-900">
              {shippingFee === 0 ? (
                <span className="text-emerald-600">Miễn phí</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
            <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary-700">
              Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển!
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
            <span className="font-black text-primary-700 text-xl">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isEmpty}
          className="w-full mt-5 btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" />
          Đặt hàng ngay
        </button>

        {/* Continue Shopping */}
        <Link
          to="/"
          className="block w-full mt-3 py-2.5 text-center text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Thanh toán an toàn, bảo mật 100%</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Truck className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Giao hàng nhanh trong 1-3 ngày</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Gift className="w-4 h-4 text-pink-500 shrink-0" />
            <span>Đổi trả trong 7 ngày nếu lỗi</span>
          </div>
        </div>
      </div>

      {/* COD Info */}
      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Thanh toán khi nhận hàng (COD)</p>
        <p className="text-xs opacity-80">
          Bạn chỉ thanh toán khi nhận được sản phẩm. An toàn và tiện lợi.
        </p>
      </div>
    </div>
  );
}
