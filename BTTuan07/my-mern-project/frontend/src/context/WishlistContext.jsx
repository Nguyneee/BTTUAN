import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import wishlistAPI from '../api/wishlist.api';
import { useAuthContext } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuthContext();
  const [wishlistIds, setWishlistIds] = useState(new Set()); // Set of product IDs
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlistIds(new Set()); setWishlistItems([]); return; }
    setLoading(true);
    try {
      const res = await wishlistAPI.getWishlist();
      const items = res.data?.products || [];
      setWishlistItems(items);
      setWishlistIds(new Set(items.map((p) => p.product?._id || p.product).filter(Boolean)));
    } catch (err) {
      console.error('Load wishlist error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const toggle = useCallback(async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const res = await wishlistAPI.toggle(productId);
      const { added } = res.data;
      setWishlistIds((prev) => {
        const next = new Set(prev);
        added ? next.add(productId) : next.delete(productId);
        return next;
      });
      if (added) {
        // Optimistically reload to get full product data
        loadWishlist();
      } else {
        setWishlistItems((prev) =>
          prev.filter((p) => (p.product?._id || p.product) !== productId)
        );
      }
      return added;
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      return null;
    }
  }, [isAuthenticated, loadWishlist]);

  const isWishlisted = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  const clearWishlist = useCallback(async () => {
    try {
      await wishlistAPI.clear();
      setWishlistIds(new Set());
      setWishlistItems([]);
    } catch (err) { console.error(err); }
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlistIds, wishlistItems, loading,
      toggle, isWishlisted, clearWishlist, loadWishlist,
      total: wishlistIds.size,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
