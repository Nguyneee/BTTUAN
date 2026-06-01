import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Package, TrendingUp, Tag, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ImageSwiper from '../components/detail/ImageSwiper';
import QuantitySelector from '../components/detail/QuantitySelector';
import StockBadge from '../components/detail/StockBadge';
import SimilarProducts from '../components/detail/SimilarProducts';
import { useCart } from '../hooks/useCart';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get(`/products/${id}`);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts || []);
        setQuantity(1);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (stock === 0) return;
    const result = await addToCart(id, quantity);
    if (result.success) {
      setAdded(true);
      setAddError('');
      setTimeout(() => setAdded(false), 2000);
    } else {
      setAddError(result.error || 'Không thể thêm vào giỏ hàng');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        <Link to="/" className="btn-primary mt-4 inline-flex">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const {
    name, price, originalPrice, discount, description,
    images, imageUrl, category, stock, sold, isNew, tags, specs,
  } = product;

  const displayImages = (images && images.length > 0) ? images : (imageUrl ? [imageUrl] : []);
  const hasSale = discount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          {category && (
            <>
              <Link
                to={`/search?categorySlug=${category.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {category.icon} {category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}
          <span className="text-gray-900 font-medium line-clamp-1">{name}</span>
        </nav>

        {/* Main product section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Image Swiper */}
            <div>
              <ImageSwiper images={displayImages} productName={name} />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-4 animate-slide-up">

              {/* Category + New badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <Link
                    to={`/search?categorySlug=${category.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {category.icon} {category.name}
                  </Link>
                )}
                {isNew && <span className="badge-new">✨ Hàng mới</span>}
                {hasSale && <span className="badge-sale">🔥 -{discount}%</span>}
              </div>

              {/* Product name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {name}
              </h1>

              {/* Rating + sold */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">4.0</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  <span>Đã bán <strong className="text-gray-900">{sold.toLocaleString()}</strong> sản phẩm</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl font-black text-primary-700">
                    {formatPrice(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                  {hasSale && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                      Tiết kiệm {formatPrice(originalPrice - price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <StockBadge stock={stock} />
              </div>

              {/* Quantity selector */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Số lượng:</p>
                <QuantitySelector quantity={quantity} onchange={setQuantity} stock={stock} />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 flex-wrap">
                {addError && (
                  <div className="w-full text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {addError}
                  </div>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className={`flex-1 btn-primary min-w-[160px] ${added ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {added ? '✓ Đã thêm!' : 'Thêm vào giỏ'}
                </button>
                <Link
                  to="/cart"
                  className="flex-1 btn-accent min-w-[160px] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Mua ngay
                </Link>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?tags=${tag}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            {['description', 'specs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'description' ? '📋 Mô tả sản phẩm' : '⚙️ Thông số kỹ thuật'}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'description' ? (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {description ? (
                  <p>{description}</p>
                ) : (
                  <p className="text-gray-400 italic">Chưa có mô tả sản phẩm.</p>
                )}
              </div>
            ) : (
              <div>
                {specs && specs.size > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {[...specs.entries()].map(([key, val]) => (
                        <tr key={key} className="border-b border-gray-50 last:border-0">
                          <td className="py-2.5 pr-4 text-gray-500 font-medium w-1/3">{key}</td>
                          <td className="py-2.5 text-gray-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400 italic">Chưa có thông số kỹ thuật.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-8">
          <SimilarProducts products={similarProducts} />
        </div>
      </div>
    </div>
  );
}
