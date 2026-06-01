import { useState } from 'react';
import { Send, Gift, Loader2, X } from 'lucide-react';
import StarRating from './StarRating';
import reviewAPI from '../../api/review.api';

const STAR_LABELS = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời!' };

/**
 * ReviewForm — form đánh giá sản phẩm sau khi đã mua thành công
 * @param {string} productId
 * @param {string} orderId
 * @param {string} productName
 * @param {function} onSuccess(review) — callback sau khi đánh giá xong
 * @param {function} onCancel
 */
export default function ReviewForm({ productId, orderId, productName, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Vui lòng chọn số sao đánh giá'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await reviewAPI.create({ productId, orderId, rating, comment });
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Đánh giá sản phẩm</h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{productName}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star selection */}
        <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-xl">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <p className={`text-sm font-semibold transition-colors ${rating > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
            {rating > 0 ? STAR_LABELS[rating] : 'Chọn số sao'}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bình luận <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
        </div>

        {/* Reward notice */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Gift className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Bạn sẽ nhận <strong>50 điểm tích lũy</strong> sau khi đánh giá thành công!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Huỷ
            </button>
          )}
          <button type="submit" disabled={loading || rating === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
}
