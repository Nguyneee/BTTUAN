import { useEffect, useState } from 'react';
import { productAPI } from '../../api/product.api';
import HorizontalCarousel from '../search/HorizontalCarousel';

export default function PopularProductsSection() {
  const [activeTab, setActiveTab] = useState('sold');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getPopular({ type: activeTab, limit: 10 });
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to fetch popular products', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, [activeTab]);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-title">⭐ San Pham Noi Bat</h2>
          <p className="section-subtitle">Top 10 san pham duoc yeu thich nhat</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('sold')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'sold'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ban chay
          </button>
          <button
            onClick={() => setActiveTab('views')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'views'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Xem nhieu
          </button>
        </div>
      </div>

      <HorizontalCarousel products={products} loading={loading} itemsPerPage={5} />
    </section>
  );
}
