import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, MapPin, Phone, Package, Calendar,
  AlertTriangle, Clock, X, Star,
} from 'lucide-react';
import { orderAPI } from '../api/order.api';
import StatusBadge from '../components/order/StatusBadge';
import OrderStatusStepper from '../components/order/OrderStatusStepper';
import { ORDER_STATUS } from '../components/order/orderStatusConfig';
import ReviewForm from '../components/review/ReviewForm';
import reviewAPI from '../api/review.api';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const CANCEL_WINDOW_MS = 30 * 60 * 1000;

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  // Review state
  const [reviewingItem, setReviewingItem] = useState(null); // { product, name }
  const [reviewedProducts, setReviewedProducts] = useState(new Set());
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await orderAPI.getOrderDetail(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Không tìm thấy đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await orderAPI.cancelOrder(id, cancelReason);
      setOrder(res.data);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCancel = async () => {
    setActionLoading(true);
    try {
      const res = await orderAPI.requestCancel(id, cancelReason);
      setOrder(res.data);
      setShowRequestModal(false);
      setCancelReason('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Không thể gửi yêu cầu hủy');
    } finally {
      setActionLoading(false);
    }
  };

  // Check if cancel window expired (for PENDING orders)
  const canCancelDirectly =
    order &&
    (order.status === ORDER_STATUS.CONFIRMED ||
      (order.status === ORDER_STATUS.PENDING &&
        Date.now() - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS));

  // Check reviewed products on load
  useEffect(() => {
    if (!order || order.status !== ORDER_STATUS.DELIVERED) return;
    const checkReviewed = async () => {
      const reviewed = new Set();
      await Promise.all(
        order.items.map(async (item) => {
          try {
            const res = await reviewAPI.canReview(order._id, item.product);
            if (!res.data?.canReview) reviewed.add(item.product);
          } catch {}
        })
      );
      setReviewedProducts(reviewed);
    };
    checkReviewed();
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-60 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Không tìm thấy đơn hàng'}</h2>
          <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Quay lại đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const { orderCode, status, items, shippingAddress, totalAmount, subtotal, shippingFee, createdAt, estimatedDelivery, statusHistory, cancelReason: existingCancelReason, couponCode, discountAmount } = order;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Quay lại đơn hàng</span>
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Order Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-gray-900">Đơn hàng</h1>
                <span className="text-2xl font-black text-primary-700">{orderCode}</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Đặt lúc: {formatDate(createdAt)}
              </p>
            </div>
            <StatusBadge status={status} size="lg" />
          </div>

          {/* Status Stepper */}
          <OrderStatusStepper currentStatus={status} />

          {/* Cancel window warning for PENDING */}
          {status === ORDER_STATUS.PENDING && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl p-3">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Bạn có thể hủy đơn trong vòng <strong>30 phút</strong> sau khi đặt hàng.
                Sau đó, đơn sẽ được xác nhận tự động.
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary-600" />
                Sản phẩm ({items.length})
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                        )}
                      </div>
                      {/* Nút đánh giá cho đơn DELIVERED */}
                      {status === ORDER_STATUS.DELIVERED && (
                        reviewedProducts.has(item.product) ? (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Đã đánh giá
                          </span>
                        ) : (
                          <button
                            onClick={() => setReviewingItem({ product: item.product, name: item.name })}
                            className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full hover:bg-primary-100 transition-colors"
                          >
                            <Star className="w-3 h-3" /> Viết đánh giá
                          </button>
                        )
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary-700 text-sm">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.price)} / cái</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            {statusHistory && statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4">Lịch sử trạng thái</h2>
                <div className="flex flex-col gap-0">
                  {statusHistory.map((h, idx) => (
                    <div key={idx} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm">{h.note || 'Cập nhật trạng thái'}</p>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(h.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                Địa chỉ giao hàng
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-gray-900">{shippingAddress.fullName}</p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {shippingAddress.phone}
                </p>
                <p className="text-gray-500">{shippingAddress.address}</p>
                <p className="text-gray-500">{shippingAddress.city}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Giảm giá {couponCode ? `(${couponCode})` : ''}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-black text-primary-700 text-lg">{formatPrice(totalAmount)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Phương thức</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      COD - Thanh toán khi nhận hàng
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            {estimatedDelivery && status !== ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.DELIVERED && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-1">Dự kiến giao hàng</p>
                <p className="text-blue-700">{formatDate(estimatedDelivery)}</p>
              </div>
            )}

            {/* Cancel Reason */}
            {existingCancelReason && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-sm">
                <p className="font-semibold text-red-900 mb-1">Lý do hủy</p>
                <p className="text-red-700">{existingCancelReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            {(canCancelDirectly || status === ORDER_STATUS.PROCESSING) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                {canCancelDirectly ? (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Hủy đơn hàng
                  </button>
                ) : status === ORDER_STATUS.PROCESSING ? (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full py-2.5 text-sm font-semibold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    Yêu cầu hủy đơn
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Hủy đơn hàng</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng <strong>{orderCode}</strong>? Hành động này không thể hoàn tác.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Lý do hủy (tùy chọn)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Không, giữ đơn
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Cancel Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yêu cầu hủy đơn</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Đơn hàng đang được chuẩn bị. Yêu cầu hủy sẽ được gửi đến shop để xem xét.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Lý do yêu cầu hủy"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRequestCancel}
                disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <ReviewForm
              productId={reviewingItem.product}
              orderId={order._id}
              productName={reviewingItem.name}
              onSuccess={(data) => {
                setReviewedProducts((prev) => new Set([...prev, reviewingItem.product]));
                setReviewingItem(null);
                setReviewSuccess(`Đánh giá thành công! Bạn nhận được ${data?.rewardPoints || 50} điểm tích lũy 🎉`);
                setTimeout(() => setReviewSuccess(''), 5000);
              }}
              onCancel={() => setReviewingItem(null)}
            />
          </div>
        </div>
      )}

      {/* Success Toast */}
      {reviewSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium animate-fade-in">
          <Star className="w-4 h-4 fill-white" />
          {reviewSuccess}
        </div>
      )}
    </div>
  );
}
