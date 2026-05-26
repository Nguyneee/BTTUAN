import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, loading } = useCart();

  const { product, quantity } = item;
  if (!product) return null;

  const displayImages = product.images?.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const lineTotal = product.price * quantity;
  const outOfStock = product.stock === 0;

  const handleDecrement = async () => {
    if (quantity > 1) {
      await updateQuantity(product._id, quantity - 1);
    }
  };

  const handleIncrement = async () => {
    if (quantity < product.stock) {
      await updateQuantity(product._id, quantity + 1);
    }
  };

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 ${outOfStock ? 'opacity-60' : ''}`}>
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
          {displayImages.length > 0 ? (
            <img
              src={displayImages[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
              📦
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            to={`/products/${product._id}`}
            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-primary-700 font-bold text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock warning */}
          {outOfStock ? (
            <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Hết hàng
            </span>
          ) : product.stock <= 5 ? (
            <span className="inline-block mt-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Chỉ còn {product.stock} sản phẩm
            </span>
          ) : null}
        </div>

        {/* Quantity Controls + Remove */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <span className="w-10 text-center font-semibold text-gray-900 text-sm">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= product.stock || loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Line Total + Remove */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary-700 text-sm sm:text-base">
              {formatPrice(lineTotal)}
            </span>
            <button
              onClick={() => removeFromCart(product._id)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              title="Xóa sản phẩm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
