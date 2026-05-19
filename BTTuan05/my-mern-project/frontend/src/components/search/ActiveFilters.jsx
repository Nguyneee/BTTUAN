import { X } from 'lucide-react';

const LABEL_MAP = {
  inStock: '✅ Còn hàng',
  onSale: '🔥 Đang sale',
  isNew: '✨ Hàng mới',
};

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(p) + 'đ';

export default function ActiveFilters({ searchParams, updateParam }) {
  const chips = [];

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');
  const onSale = searchParams.get('onSale');
  const isNew = searchParams.get('isNew');
  const tags = searchParams.get('tags');
  const q = searchParams.get('q');

  if (q) chips.push({ key: 'q', label: `Tìm: "${q}"`, clear: () => updateParam('q', '') });
  if (minPrice || maxPrice) {
    const label = minPrice && maxPrice
      ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
      : minPrice ? `Từ ${formatPrice(minPrice)}` : `Đến ${formatPrice(maxPrice)}`;
    chips.push({
      key: 'price',
      label,
      clear: () => { updateParam('minPrice', ''); updateParam('maxPrice', ''); },
    });
  }
  if (inStock === 'true') chips.push({ key: 'inStock', label: LABEL_MAP.inStock, clear: () => updateParam('inStock', '') });
  if (onSale === 'true') chips.push({ key: 'onSale', label: LABEL_MAP.onSale, clear: () => updateParam('onSale', '') });
  if (isNew === 'true') chips.push({ key: 'isNew', label: LABEL_MAP.isNew, clear: () => updateParam('isNew', '') });

  if (tags) {
    tags.split(',').filter(Boolean).forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `#${tag}`,
        clear: () => {
          const remaining = tags.split(',').filter((t) => t !== tag).join(',');
          updateParam('tags', remaining);
        },
      });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full"
        >
          {chip.label}
          <button
            onClick={chip.clear}
            className="hover:text-primary-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
