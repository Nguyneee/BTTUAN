import { Link } from 'react-router-dom';

const categories = [
  { name: 'Điện thoại', icon: '📱', slug: 'dien-thoai', color: 'bg-blue-50 hover:bg-blue-100', iconBg: 'bg-blue-100' },
  { name: 'Laptop', icon: '💻', slug: 'laptop', color: 'bg-purple-50 hover:bg-purple-100', iconBg: 'bg-purple-100' },
  { name: 'Tai nghe', icon: '🎧', slug: 'tai-nghe', color: 'bg-pink-50 hover:bg-pink-100', iconBg: 'bg-pink-100' },
  { name: 'Tablet', icon: '📟', slug: 'may-tinh-bang', color: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-100' },
  { name: 'Phụ kiện', icon: '🔌', slug: 'phu-kien', color: 'bg-emerald-50 hover:bg-emerald-100', iconBg: 'bg-emerald-100' },
];

export default function CategoryGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title">Danh mục sản phẩm</h2>
          <p className="section-subtitle">Chọn danh mục bạn quan tâm</p>
        </div>
        <Link to="/search" className="text-primary-600 text-sm font-semibold hover:underline">
          Tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/search?categorySlug=${cat.slug}`}
            className={`${cat.color} rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group`}
          >
            <div className={`${cat.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200`}>
              {cat.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
