import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../hooks/useCart';
import StarRating from '../components/review/StarRating';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

export default function WishlistPage() {
  const { wishlistItems, loading, toggle, clearWishlist, total } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} sản phẩm</p>
          </div>
        </div>
        {total > 0 && (
          <button
            onClick={clearWishlist}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Empty state */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-gray-400 text-sm mb-6">
            Nhấn vào biểu tượng ❤️ trên sản phẩm để thêm vào danh sách yêu thích
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((item) => {
            const p = item.product;
            if (!p) return null;
            const productId = p._id;
            const image = p.imageUrl || p.images?.[0];
            const hasDiscount = p.salePrice && p.salePrice < p.price;
            const displayPrice = hasDiscount ? p.salePrice : p.price;
            const discountPct = hasDiscount ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

            return (
              <div key={productId}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <Link to={`/product/${productId}`} className="block relative">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {image ? (
                      <img src={image} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-200" />
                      </div>
                    )}
                  </div>
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{discountPct}%
                    </span>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">Hết hàng</span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link to={`/product/${productId}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-primary-600 transition-colors mb-1">
                      {p.name}
                    </h3>
                  </Link>

                  {p.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <StarRating value={Math.round(p.averageRating)} size="sm" />
                      <span className="text-xs text-gray-400">({p.reviewCount})</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base font-bold text-primary-700">{fmt(displayPrice)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">{fmt(p.price)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => p.stock > 0 && addToCart({ productId, name: p.name, price: displayPrice, image, quantity: 1 })}
                      disabled={p.stock === 0}
                      className="flex-1 py-2 text-xs font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {p.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                    <button
                      onClick={() => toggle(productId)}
                      className="p-2 rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <Heart className="w-4 h-4 fill-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
