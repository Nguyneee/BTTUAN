import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, Star, MessageSquare, Info, Filter } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import notificationAPI from '../api/notification.api';

const TYPE_ICON = {
  ORDER_NEW: { icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-500 bg-blue-100' },
  ORDER_STATUS_CHANGED: { icon: <ShoppingBag className="w-5 h-5" />, color: 'text-green-500 bg-green-100' },
  REVIEW_NEW: { icon: <Star className="w-5 h-5" />, color: 'text-amber-500 bg-amber-100' },
  COMMENT_NEW: { icon: <MessageSquare className="w-5 h-5" />, color: 'text-purple-500 bg-purple-100' },
  SYSTEM: { icon: <Info className="w-5 h-5" />, color: 'text-gray-500 bg-gray-100' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function NotificationsPage() {
  const { markAllAsRead, deleteNotif } = useSocket();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadAll = useCallback(async (pg = 1, f = 'all') => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (f === 'unread') params.isRead = false;
      const res = await notificationAPI.getAll(params);
      setItems(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll(page, filter);
  }, [loadAll, page, filter]);

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    await notificationAPI.markAsRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleDelete = async (id) => {
    await deleteNotif(id);
    setItems((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <Bell className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-sm text-gray-500">Tất cả hoạt động của bạn</p>
          </div>
        </div>
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          Đọc tất cả
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[{ key: 'all', label: 'Tất cả' }, { key: 'unread', label: 'Chưa đọc' }].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Không có thông báo nào</p>
          </div>
        ) : (
          items.map((notif) => {
            const typeInfo = TYPE_ICON[notif.type] || TYPE_ICON.SYSTEM;
            return (
              <div
                key={notif._id}
                className={`flex gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50/40' : ''
                }`}
                onClick={() => handleMarkRead(notif._id, notif.isRead)}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${typeInfo.color}`}>
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notif.title}
                    {!notif.isRead && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 align-middle" />
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-all flex-shrink-0"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                pg === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
