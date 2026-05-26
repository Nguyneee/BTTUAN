import { ChevronDown } from 'lucide-react';

const OPTIONS = [
  { value: 'newest', label: '🆕 Mới nhất' },
  { value: 'best_seller', label: '🔥 Bán chạy nhất' },
  { value: 'price_asc', label: '💰 Giá tăng dần' },
  { value: 'price_desc', label: '💎 Giá giảm dần' },
  { value: 'name_asc', label: '🔤 Tên A→Z' },
];

export default function SortDropdown({ value, onChange }) {
  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
