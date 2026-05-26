import { useCartContext } from '../context/CartContext';
import { cartAPI } from '../api/cart.api';

/**
 * Custom hook for cart operations.
 * Mirrors useAuth pattern.
 */
export function useCart() {
  const { items, subtotal, cartCount, loading, error, dispatch, fetchCart } = useCartContext();

  const addToCart = async (productId, quantity = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.addItem(productId, quantity);
      dispatch({ type: 'SET_CART', payload: res.data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Không thể thêm vào giỏ hàng';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.updateItem(productId, quantity);
      dispatch({ type: 'SET_CART', payload: res.data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Không thể cập nhật số lượng';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const removeFromCart = async (productId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.removeItem(productId);
      dispatch({ type: 'SET_CART', payload: res.data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Không thể xóa sản phẩm';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Không thể xóa giỏ hàng';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return {
    items,
    subtotal,
    cartCount,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    clearError,
  };
}
