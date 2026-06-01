import { Star } from 'lucide-react';

/**
 * StarRating — dùng chung để hiển thị hoặc chọn sao
 * @param {number} value - giá trị hiện tại (1-5)
 * @param {function} onChange - nếu có → interactive (chọn sao)
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const cls = sizes[size] || sizes.md;
  const interactive = !!onChange;

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} transition-all duration-100 ${
            star <= value
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 fill-gray-100'
          } ${interactive ? 'hover:text-amber-400 hover:fill-amber-300 hover:scale-110' : ''}`}
          onClick={interactive ? () => onChange(star) : undefined}
        />
      ))}
    </div>
  );
}
