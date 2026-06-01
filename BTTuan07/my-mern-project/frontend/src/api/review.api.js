import axiosClient from './axiosClient';

const reviewAPI = {
  // Kiểm tra có thể đánh giá không
  canReview: (orderId, productId) => axiosClient.get(`/reviews/can-review/${orderId}/${productId}`),

  // Tạo đánh giá
  create: (data) => axiosClient.post('/reviews', data),

  // Đánh giá của sản phẩm
  getByProduct: (productId, params = {}) => axiosClient.get(`/reviews/product/${productId}`, { params }),

  // Đánh giá của tôi
  getMyReviews: (params = {}) => axiosClient.get('/reviews/my', { params }),

  // Điểm tích lũy + lịch sử
  getMyPoints: () => axiosClient.get('/reviews/my-points'),
};

export default reviewAPI;
