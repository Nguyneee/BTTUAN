import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/cart.api';

const initialState = {
  items: [],
  subtotal: 0,
  cartCount: 0,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        subtotal: action.payload.subtotal || 0,
        cartCount: action.payload.cartCount || 0,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_CART':
      return { ...state, items: [], subtotal: 0, cartCount: 0, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.error?.message || 'Không thể tải giỏ hàng' });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ ...state, dispatch, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};
