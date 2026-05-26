import axiosClient from './axiosClient';

export const cartAPI = {
  /**
   * Get current user's cart
   */
  getCart: () => axiosClient.get('/cart'),

  /**
   * Add item to cart
   * @param {string} productId
   * @param {number} quantity
   */
  addItem: (productId, quantity = 1) =>
    axiosClient.post('/cart/items', { productId, quantity }),

  /**
   * Update item quantity
   * @param {string} productId
   * @param {number} quantity
   */
  updateItem: (productId, quantity) =>
    axiosClient.put(`/cart/items/${productId}`, { quantity }),

  /**
   * Remove item from cart
   * @param {string} productId
   */
  removeItem: (productId) => axiosClient.delete(`/cart/items/${productId}`),

  /**
   * Clear entire cart
   */
  clearCart: () => axiosClient.delete('/cart'),
};
