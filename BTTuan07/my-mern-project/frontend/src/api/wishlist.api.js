import axiosClient from './axiosClient';

const wishlistAPI = {
  // Lấy danh sách yêu thích
  getWishlist: () => axiosClient.get('/wishlist'),

  // Toggle thêm/xóa sản phẩm
  toggle: (productId) => axiosClient.post(`/wishlist/toggle/${productId}`),

  // Kiểm tra sản phẩm có trong wishlist không
  check: (productId) => axiosClient.get(`/wishlist/check/${productId}`),

  // Xóa tất cả
  clear: () => axiosClient.delete('/wishlist/clear'),

  // Lịch sử xem
  getHistory: (params = {}) => axiosClient.get('/wishlist/history', { params }),

  // Ghi nhận lượt xem
  recordView: (productId) => axiosClient.post(`/wishlist/history/${productId}`),

  // Xóa lịch sử
  clearHistory: () => axiosClient.delete('/wishlist/history'),
};

export default wishlistAPI;
