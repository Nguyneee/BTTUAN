import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, Package, Eye } from 'lucide-react';
import wishlistAPI from '../api/wishlist.api';
import WishlistButton from '../components/WishlistButton';
import StarRating from '../components/review/StarRating';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function ViewHistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getHistory({ limit: 50 });
      setItems(res.data?.products || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const clearHistory = async () => {
    if (!window.confirm('Xóa toàn bộ lịch sử xem?')) return;
    await wishlistAPI.clearHistory();
    setItems([]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <History className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đã xem gần đây</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} sản phẩm</p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            Xóa lịch sử
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-2xl h-56" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Eye className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Chưa xem sản phẩm nào</h2>
          <p className="text-gray-400 text-sm mb-6">Các sản phẩm bạn đã xem sẽ xuất hiện tại đây</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
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
                        <Package className="w-12 h-12 text-gray-200" />
                      </div>
                    )}
                  </div>
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      -{discountPct}%
                    </span>
                  )}
                  <div className="absolute top-2 right-2">
                    <WishlistButton productId={productId} size="sm" />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link to={`/product/${productId}`}>
                    <h3 className="font-semibold text-gray-900 text-xs line-clamp-2 hover:text-primary-600 mb-1">
                      {p.name}
                    </h3>
                  </Link>
                  {p.averageRating > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <StarRating value={Math.round(p.averageRating)} size="sm" />
                    </div>
                  )}
                  <p className="text-sm font-bold text-primary-700">{fmt(displayPrice)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">
                      Xem {item.viewCount}x • {timeAgo(item.viewedAt)}
                    </span>
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
