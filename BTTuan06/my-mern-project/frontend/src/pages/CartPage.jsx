import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

export default function CartPage() {
  const { items, subtotal, cartCount, loading, error, clearError } = useCart();
  const isEmpty = items.length === 0;

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
            {!isEmpty && (
              <p className="text-sm text-gray-500">{cartCount} sản phẩm trong giỏ</p>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 text-xl leading-none px-2">
              &times;
            </button>
          </div>
        )}

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá cửa hàng và thêm sản phẩm yêu thích nhé!
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <Package className="w-4 h-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          /* Main Content */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {/* Select All Header */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">
                  Tất cả ({cartCount} sản phẩm)
                </p>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <CartItem key={item.product?._id} item={item} />
                ))}
              </div>

              {/* Mobile: Summary at bottom */}
              <div className="lg:hidden mt-4">
                <CartSummary
                  subtotal={subtotal}
                  cartCount={cartCount}
                  items={items}
                />
              </div>
            </div>

            {/* Desktop: Summary Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <CartSummary
                  subtotal={subtotal}
                  cartCount={cartCount}
                  items={items}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
