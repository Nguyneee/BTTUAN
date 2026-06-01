import axiosClient from './axiosClient';

const notificationAPI = {
  // Lấy danh sách thông báo (phân trang)
  getAll: (params = {}) => axiosClient.get('/notifications', { params }),

  // Số thông báo chưa đọc
  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),

  // Đánh dấu 1 đã đọc
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),

  // Xóa thông báo
  deleteOne: (id) => axiosClient.delete(`/notifications/${id}`),
};

export default notificationAPI;
