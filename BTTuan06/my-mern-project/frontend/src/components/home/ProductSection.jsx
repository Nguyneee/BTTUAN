import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';

/**
 * ProductSection — Reusable section for displaying a list of products.
 * Used for "Bán chạy nhất", "Mới nhất", "Khuyến mãi"...
 */
export default function ProductSection({
  title,
  subtitle,
  viewAllLink,
  products = [],
  loading = false,
  emptyText = 'Chưa có sản phẩm',
  cols = 4,
}) {
  const colClass = {
    2: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <section>
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors whitespace-nowrap"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className={`grid ${colClass} gap-4`}>
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      {!loading && products.length > 0 && (
        <div className={`grid ${colClass} gap-4`}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📦</div>
          <p>{emptyText}</p>
        </div>
      )}
    </section>
  );
}
