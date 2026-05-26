import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { orderAPI } from '../api/order.api';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderDetail(id);
        setOrder(res.data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const { orderCode, totalAmount, shippingAddress, items } = order;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
          {/* Checkmark animation */}
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce-once">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-6">
            Cảm ơn bạn đã đặt hàng tại <strong className="text-primary-600">TechStore</strong>.
            <br />Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.
          </p>

          {/* Order Code */}
          <div className="bg-primary-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Mã đơn hàng</p>
            <p className="text-xl font-black text-primary-700">{orderCode}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Sản phẩm
              </span>
              <span className="text-sm font-semibold text-gray-900">{items.length} sản phẩm</span>
            </div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-500">Thanh toán</span>
              <span className="text-sm font-bold text-amber-600">COD - Thanh toán khi nhận hàng</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tổng cộng</span>
              <span className="text-lg font-black text-primary-700">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left text-sm">
            <p className="font-semibold text-gray-900 mb-2">Giao đến:</p>
            <p className="text-gray-700 font-medium">{shippingAddress.fullName}</p>
            <p className="text-gray-500">{shippingAddress.phone}</p>
            <p className="text-gray-500">{shippingAddress.address}, {shippingAddress.city}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              to={`/orders/${id}`}
              className="w-full btn-primary py-3 text-base font-bold flex items-center justify-center gap-2"
            >
              Xem chi tiết đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/orders"
              className="w-full py-3 text-center text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Xem lịch sử đặt hàng
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
