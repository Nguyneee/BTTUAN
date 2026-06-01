import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, ShoppingBag, Star, MessageSquare, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const TYPE_ICON = {
  ORDER_NEW: <ShoppingBag className="w-4 h-4 text-blue-500" />,
  ORDER_STATUS_CHANGED: <ShoppingBag className="w-4 h-4 text-green-500" />,
  REVIEW_NEW: <Star className="w-4 h-4 text-amber-500" />,
  COMMENT_NEW: <MessageSquare className="w-4 h-4 text-purple-500" />,
  SYSTEM: <Info className="w-4 h-4 text-gray-500" />,
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, loadingNotifs, markAsRead, markAllAsRead, deleteNotif } = useSocket();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Thông báo {unreadCount > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{unreadCount} mới</span>}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
            {loadingNotifs ? (
              <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => (
                <div
                  key={notif._id}
                  className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotifClick(notif)}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {TYPE_ICON[notif.type] || <Info className="w-4 h-4 text-gray-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                        className="p-1 rounded hover:bg-green-100 text-green-600"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                      className="p-1 rounded hover:bg-red-100 text-red-400"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
              >
                Xem tất cả thông báo →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
