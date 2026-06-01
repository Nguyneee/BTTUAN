import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, ChevronRight, Filter } from 'lucide-react';
import { orderAPI } from '../api/order.api';
import StatusBadge from '../components/order/StatusBadge';
import { ORDER_STATUS } from '../components/order/orderStatusConfig';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_TABS = [
  { label: 'Tất cả', value: null },
  { label: 'Đang xử lý', value: ORDER_STATUS.PENDING },
  { label: 'Đã xác nhận', value: ORDER_STATUS.CONFIRMED },
  { label: 'Đang giao', value: ORDER_STATUS.SHIPPING },
  { label: 'Đã giao', value: ORDER_STATUS.DELIVERED },
  { label: 'Đã hủy', value: ORDER_STATUS.CANCELLED },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await orderAPI.getMyOrders({
          page,
          limit: 10,
          status: filterStatus || undefined,
        });
        setOrders(res.data);
        setPagination(res.meta?.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.total} đơn hàng` : 'Quản lý đơn hàng của bạn'}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-2 mb-6 overflow-x-auto shadow-sm">
          <div className="flex gap-1.5 min-w-max">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => { setFilterStatus(tab.value); setPage(1); }}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap ${
                  filterStatus === tab.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {filterStatus ? 'Không có đơn hàng nào' : 'Chưa có đơn hàng nào'}
            </h2>
            <p className="text-gray-500 mb-6">
              {filterStatus
                ? 'Không có đơn hàng nào ở trạng thái này.'
                : 'Hãy bắt đầu mua sắm và tạo đơn hàng đầu tiên của bạn!'}
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          /* Order List */
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{order.orderCode}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>

                {/* Items Preview */}
                <div className="flex gap-3 overflow-hidden mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                          📦
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-gray-500">
                        +{order.items.length - 3}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex items-center">
                    <p className="text-sm text-gray-500 truncate pl-2">
                      {order.items[0]?.name}
                      {order.items.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-sm text-gray-500">
                    {order.items.length} sản phẩm
                  </span>
                  <span className="font-black text-primary-700 text-lg">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                  Trang {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
