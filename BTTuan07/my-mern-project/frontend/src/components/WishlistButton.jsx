import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * WishlistButton — nút tim để thêm/xóa sản phẩm yêu thích
 * @param {string} productId
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - thêm class tuỳ chỉnh
 */
export default function WishlistButton({ productId, size = 'md', className = '' }) {
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const wishlisted = isWishlisted(productId);

  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4.5 h-4.5', lg: 'w-5 h-5' };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAnimating(true);
    await toggle(productId);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizes[size]} flex items-center justify-center rounded-full transition-all duration-200
        ${wishlisted
          ? 'bg-red-500 text-white shadow-md shadow-red-200 hover:bg-red-600'
          : 'bg-white text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-400 shadow-sm'
        }
        ${animating ? 'scale-125' : 'scale-100'}
        ${className}`}
      title={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      aria-label={wishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart
        className={`${iconSizes[size] || 'w-4 h-4'} transition-all ${wishlisted ? 'fill-white' : ''}`}
      />
    </button>
  );
}
