import { useState, useEffect } from 'react';
import {
  Package, Search, ChevronLeft, ChevronRight,
  X, Eye, CheckCircle, Truck, Clock, DollarSign,
} from 'lucide-react';
import { orderAPI } from '../../api/order.api';
import StatusBadge from '../../components/order/StatusBadge';
import { ORDER_STATUS } from '../../components/order/orderStatusConfig';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_TABS = [
  { label: 'Tất cả', value: null },
  { label: 'Mới', value: ORDER_STATUS.PENDING },
  { label: 'Đã xác nhận', value: ORDER_STATUS.CONFIRMED },
  { label: 'Đang chuẩn bị', value: ORDER_STATUS.PROCESSING },
  { label: 'Đang giao', value: ORDER_STATUS.SHIPPING },
  { label: 'Đã giao', value: ORDER_STATUS.DELIVERED },
  { label: 'Yêu cầu hủy', value: ORDER_STATUS.CANCEL_REQUESTED },
  { label: 'Đã hủy', value: ORDER_STATUS.CANCELLED },
];

// Next valid status options for each status
const NEXT_STATUS_OPTIONS = {
  [ORDER_STATUS.PENDING]: [
    { value: ORDER_STATUS.CONFIRMED, label: 'Xác nhận đơn hàng' },
    { value: ORDER_STATUS.CANCELLED, label: 'Hủy đơn' },
  ],
  [ORDER_STATUS.CONFIRMED]: [
    { value: ORDER_STATUS.PROCESSING, label: 'Bắt đầu chuẩn bị' },
    { value: ORDER_STATUS.CANCELLED, label: 'Hủy đơn' },
  ],
  [ORDER_STATUS.PROCESSING]: [
    { value: ORDER_STATUS.SHIPPING, label: 'Giao cho đơn vị vận chuyển' },
  ],
  [ORDER_STATUS.CANCEL_REQUESTED]: [
    { value: ORDER_STATUS.PROCESSING, label: 'Từ chối hủy, tiếp tục chuẩn bị' },
    { value: ORDER_STATUS.CANCELLED, label: 'Chấp nhận hủy đơn' },
  ],
  [ORDER_STATUS.SHIPPING]: [
    { value: ORDER_STATUS.DELIVERED, label: 'Xác nhận đã giao' },
  ],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderAPI.getAllOrders({
        page,
        limit: 15,
        status: filterStatus || undefined,
        search: search || undefined,
      });
      setOrders(res.data);
      setPagination(res.meta?.pagination);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await orderAPI.getStats();
      setStats(res.data);
    } catch { /* silent */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setActionLoading(true);
    try {
      await orderAPI.updateStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote,
      });
      setShowModal(false);
      fetchOrders();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const nextOptions = selectedOrder ? (NEXT_STATUS_OPTIONS[selectedOrder.status] || []) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-sm text-gray-500">Xem và cập nhật trạng thái đơn hàng</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tổng đơn', value: stats.total, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Đơn mới', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Đang giao', value: stats.shipping, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Đã giao', value: stats.delivered, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs font-medium text-gray-600">{s.label}</span>
                </div>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-5 text-sm">Tìm kiếm</button>
          </div>
        </form>

        {/* Status Tabs */}
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Mã đơn</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Khách hàng</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Ngày đặt</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Sản phẩm</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Tổng tiền</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Trạng thái</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-primary-700 whitespace-nowrap">
                        {order.orderCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                          <p className="text-xs text-gray-400">{order.shippingAddress?.phone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {order.items.length} sản phẩm
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-primary-700 whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap"
                          >
                            Cập nhật
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Hiển thị trang {page} / {pagination.pages} ({pagination.total} đơn)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cập nhật trạng thái</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedOrder.orderCode}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1.5">Trạng thái hiện tại</p>
              <StatusBadge status={selectedOrder.status} size="md" />
            </div>

            {/* Next Status Options */}
            {nextOptions.length > 0 ? (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Chuyển sang</p>
                <div className="flex flex-col gap-2">
                  {nextOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        newStatus === opt.value
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newStatus"
                        value={opt.value}
                        checked={newStatus === opt.value}
                        onChange={() => setNewStatus(opt.value)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
                Không có thao tác nào khả dụng cho trạng thái này.
              </div>
            )}

            {/* Note */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-1.5">Ghi chú (tùy chọn)</p>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Đã giao cho giao hàng nhanh"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
