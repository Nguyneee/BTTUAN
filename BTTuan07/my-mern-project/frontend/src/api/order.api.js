import axiosClient from './axiosClient';

export const orderAPI = {
  /**
   * Create order from cart
   * @param {{ shippingAddress, note }} data
   */
  createOrder: (data) => axiosClient.post('/orders', data),

  /**
   * Get my orders (paginated)
   * @param {{ page, limit, status }} params
   */
  getMyOrders: (params = {}) => axiosClient.get('/orders', { params }),

  /**
   * Get order detail
   * @param {string} orderId
   */
  getOrderDetail: (orderId) => axiosClient.get(`/orders/${orderId}`),

  /**
   * Cancel order (within 30min for PENDING)
   * @param {string} orderId
   * @param {string} reason
   */
  cancelOrder: (orderId, reason) =>
    axiosClient.put(`/orders/${orderId}/cancel`, { reason }),

  /**
   * Request cancel (when PROCESSING)
   * @param {string} orderId
   * @param {string} reason
   */
  requestCancel: (orderId, reason) =>
    axiosClient.put(`/orders/${orderId}/request-cancel`, { reason }),

  /**
   * --- Admin APIs ---
   */

  /**
   * Get all orders (admin)
   * @param {{ page, limit, status, search }} params
   */
  getAllOrders: (params = {}) => axiosClient.get('/orders/admin/all', { params }),

  /**
   * Get order stats (admin)
   */
  getStats: () => axiosClient.get('/orders/admin/stats'),

  /**
   * Get admin order detail
   * @param {string} orderId
   */
  getAdminOrderDetail: (orderId) => axiosClient.get(`/orders/admin/${orderId}`),

  /**
   * Update order status (admin)
   * @param {string} orderId
   * @param {{ status, note }} data
   */
  updateStatus: (orderId, data) =>
    axiosClient.put(`/orders/${orderId}/status`, data),
};
