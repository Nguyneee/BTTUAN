import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';
import notificationAPI from '../api/notification.api';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext();
  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // ── Load initial notifications from API ────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingNotifs(true);
    try {
      const res = await notificationAPI.getAll({ limit: 30 });
      setNotifications(res.data || []);
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data?.count || 0);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoadingNotifs(false);
    }
  }, [isAuthenticated]);

  // ── Connect socket khi user đăng nhập ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Nếu logout → disconnect
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      loadNotifications();
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    // Lắng nghe notification mới
    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, loadNotifications]);

  // ── Actions ────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, []);

  const deleteNotif = useCallback(async (id) => {
    try {
      await notificationAPI.deleteOne(id);
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === id);
        if (removed && !removed.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error('Delete notif error:', err);
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        notifications,
        unreadCount,
        loadingNotifs,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotif,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
