import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { RotateCcw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_seller', label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

const PRICE_RANGES = [
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 – 5 triệu', min: 1000000, max: 5000000 },
  { label: '5 – 20 triệu', min: 5000000, max: 20000000 },
  { label: '20 – 50 triệu', min: 20000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: '' },
];

const POPULAR_TAGS = ['apple', 'samsung', 'xiaomi', 'sony', 'gaming', 'wireless', 'anc', '5g', 'flagship'];

export default function FilterSidebar({ searchParams, updateParam }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosClient.get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') || '';
  const onSale = searchParams.get('onSale') || '';
  const isNew = searchParams.get('isNew') || '';
  const tags = searchParams.get('tags') || '';

  const activeTags = tags ? tags.split(',').filter(Boolean) : [];

  const toggleTag = (tag) => {
    const current = new Set(activeTags);
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);
    updateParam('tags', [...current].join(','));
  };

  const clearAll = () => {
    ['category', 'minPrice', 'maxPrice', 'inStock', 'onSale', 'isNew', 'tags'].forEach((key) =>
      updateParam(key, '')
    );
  };

  const hasFilters = [category, minPrice, maxPrice, inStock, onSale, isNew, tags].some(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Bộ lọc</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Xóa lọc
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Danh mục</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !category ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                category === cat._id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price ranges */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Khoảng giá</h4>
        <div className="space-y-1">
          <button
            onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !minPrice && !maxPrice ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả mức giá
          </button>
          {PRICE_RANGES.map((range) => {
            const active = String(minPrice) === String(range.min) && String(maxPrice) === String(range.max);
            return (
              <button
                key={range.label}
                onClick={() => {
                  updateParam('minPrice', range.min);
                  updateParam('maxPrice', range.max);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Trạng thái</h4>
        <div className="space-y-2">
          {[
            { key: 'inStock', label: '✅ Còn hàng', value: inStock },
            { key: 'onSale', label: '🔥 Đang khuyến mãi', value: onSale },
            { key: 'isNew', label: '✨ Hàng mới', value: isNew },
          ].map(({ key, label, value }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={(e) => updateParam(key, e.target.checked ? 'true' : '')}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags phổ biến</h4>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTags.includes(tag)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
