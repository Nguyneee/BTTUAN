import axiosClient from './axiosClient';

const couponAPI = {
  // Kiểm tra coupon
  validate: (code, orderTotal) => axiosClient.post('/coupons/validate', { code, orderTotal }),

  // Lấy danh sách coupon của tôi (bao gồm public và dành riêng cho tôi)
  getMyCoupons: () => axiosClient.get('/coupons/my'),

  // Đổi điểm tích lũy lấy coupon
  exchangePoints: (option) => axiosClient.post('/coupons/exchange-points', { option }),

  // Admin: Lấy danh sách coupons (phân trang, search)
  getAllCoupons: (params) => axiosClient.get('/coupons', { params }),

  // Admin: Tạo coupon
  create: (data) => axiosClient.post('/coupons', data),

  // Admin: Cập nhật coupon
  update: (id, data) => axiosClient.put(`/coupons/${id}`, data),

  // Admin: Xóa coupon
  delete: (id) => axiosClient.delete(`/coupons/${id}`),

  // Admin: Bật/tắt hoạt động coupon
  toggleActive: (id) => axiosClient.patch(`/coupons/${id}/toggle`),
};

export default couponAPI;
