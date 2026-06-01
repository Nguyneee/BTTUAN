import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, ChevronDown } from 'lucide-react';
import StarRating from './StarRating';
import reviewAPI from '../../api/review.api';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-gray-500 text-xs">{star}</span>
      <span className="text-amber-400 text-xs">★</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-gray-400">{count}</span>
    </div>
  );
}

/**
 * ReviewList — hiển thị đánh giá sản phẩm kèm rating summary + filter
 * @param {string} productId
 * @param {number} averageRating - từ product data
 * @param {number} reviewCount - từ product data
 * @param {object} newReview - review vừa được tạo (để cập nhật realtime)
 */
export default function ReviewList({ productId, averageRating = 0, reviewCount = 0, newReview }) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [ratingDist, setRatingDist] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('');

  const loadReviews = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await reviewAPI.getByProduct(productId, {
        page: pg, limit: 8, sort: sortBy, rating: filterRating || undefined,
      });
      setReviews(res.data || []);
      setPagination(res.pagination || {});
      if (res.pagination?.ratingDistribution) setRatingDist(res.pagination.ratingDistribution);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [productId, sortBy, filterRating]);

  useEffect(() => { setPage(1); loadReviews(1); }, [loadReviews]);
  useEffect(() => { if (newReview) loadReviews(1); }, [newReview]); // eslint-disable-line

  const totalReviews = Object.values(ratingDist).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 rounded-2xl p-5">
        {/* Average */}
        <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-200 sm:pr-6 gap-1">
          <span className="text-5xl font-black text-gray-900">{averageRating.toFixed(1)}</span>
          <StarRating value={Math.round(averageRating)} size="sm" />
          <span className="text-xs text-gray-500">{reviewCount} đánh giá</span>
        </div>
        {/* Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} star={star} count={ratingDist[star] || 0} total={totalReviews} />
          ))}
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Lọc:</span>
        {['', '5', '4', '3', '2', '1'].map((r) => (
          <button key={r} onClick={() => { setFilterRating(r); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              filterRating === r ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {r ? `${r} ⭐` : 'Tất cả'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-sm text-gray-500">
          Sắp xếp:
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="ml-1 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400">
            <option value="newest">Mới nhất</option>
            <option value="highest">Điểm cao</option>
            <option value="lowest">Điểm thấp</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filterRating ? `Chưa có đánh giá ${filterRating} sao` : 'Chưa có đánh giá nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="flex gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/60 transition-colors">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {r.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{r.user?.username || 'Người dùng'}</span>
                  {r.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Đã mua hàng</span>
                  )}
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-xs text-gray-400 ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{r.comment}</p>}
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {r.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => { setPage(pg); loadReviews(pg); }}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                pg === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {pg}
            </button>
          ))}
          {page < pagination.pages && (
            <button onClick={() => { setPage(p => p + 1); loadReviews(page + 1); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
              Thêm <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
