import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../hooks/useCart';

/**
 * ProductCard — Reusable card for displaying a product in grids/lists.
 * Accepts a `product` object from the API.
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  if (!product) return null;

  const {
    _id,
    name,
    price,
    originalPrice,
    discount,
    images,
    imageUrl,
    stock,
    sold,
    isNew,
    category,
  } = product;

  const displayImage = (images && images.length > 0) ? images[0] : (imageUrl || 'https://via.placeholder.com/300x300?text=No+Image');
  const isOutOfStock = stock === 0;
  const hasSale = discount > 0;

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  return (
    <Link
      to={`/products/${_id}`}
      id={`product-card-${_id}`}
      className="group card flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="badge-new">MỚI</span>}
          {hasSale && <span className="badge-sale">-{discount}%</span>}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick add button */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const result = await addToCart(_id, 1);
                if (result.success) {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
                added ? 'bg-emerald-500' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Category tag */}
        {category && (
          <span className="text-xs text-primary-600 font-medium mb-1">
            {category.icon} {category.name}
          </span>
        )}

        {/* Product name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 flex-1">
          {name}
        </h3>

        {/* Rating (decorative) */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({sold})</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-base font-bold text-primary-700">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="mt-2">
          {isOutOfStock ? (
            <span className="text-xs text-red-500 font-medium">Hết hàng</span>
          ) : (
            <span className="text-xs text-emerald-600 font-medium">
              Còn {stock} sản phẩm
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
