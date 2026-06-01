import axiosClient from './axiosClient';

const statsAPI = {
  // Tổng quan (overview cards)
  getOverview: () => axiosClient.get('/stats/overview'),

  // Doanh thu theo thời gian
  getRevenue: (params = {}) => axiosClient.get('/stats/revenue', { params }),

  // Đơn hàng theo trạng thái + danh sách
  getOrders: (params = {}) => axiosClient.get('/stats/orders', { params }),

  // Dòng tiền
  getCashflow: (params = {}) => axiosClient.get('/stats/cashflow', { params }),

  // Khách hàng mới
  getCustomers: (params = {}) => axiosClient.get('/stats/customers', { params }),

  // Top sản phẩm bán chạy
  getTopProducts: (params = {}) => axiosClient.get('/stats/top-products', { params }),
};

export default statsAPI;
