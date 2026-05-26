import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import FlashSale from '../components/home/FlashSale';
import ProductSection from '../components/home/ProductSection';
import PopularProductsSection from '../components/home/PopularProductsSection';

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [onSale, setOnSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      setLoading(true);
      try {
        const [bs, na, sale] = await Promise.all([
          axiosClient.get('/products?sort=best_seller&limit=8'),
          axiosClient.get('/products?isNew=true&limit=8'),
          axiosClient.get('/products?onSale=true&sort=best_seller&limit=8'),
        ]);
        setBestSellers(bs.data || []);
        setNewArrivals(na.data || []);
        setOnSale(sale.data || []);
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">

        {/* Hero Banner */}
        <HeroBanner />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Flash Sale */}
        <FlashSale products={onSale} />

        {/* Popular Products Section */}
        <PopularProductsSection />

        {/* Best Sellers */}
        <ProductSection
          title="🔥 Bán Chạy Nhất"
          subtitle="Những sản phẩm được tin dùng nhất"
          viewAllLink="/search?sort=best_seller"
          products={bestSellers}
          loading={loading}
          cols={4}
        />

        {/* New Arrivals */}
        <ProductSection
          title="✨ Hàng Mới Về"
          subtitle="Sản phẩm công nghệ mới nhất 2024"
          viewAllLink="/search?isNew=true"
          products={newArrivals}
          loading={loading}
          cols={4}
        />

        {/* On Sale */}
        <ProductSection
          title="🏷️ Khuyến Mãi Đặc Biệt"
          subtitle="Ưu đãi hấp dẫn có thời hạn"
          viewAllLink="/search?onSale=true"
          products={onSale}
          loading={loading}
          cols={4}
        />

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-3">TechStore</h3>
              <p className="text-sm leading-relaxed">Thiết bị công nghệ cao cấp, chính hãng, bảo hành toàn quốc.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Danh mục</h4>
              <ul className="space-y-2 text-sm">
                {['Điện thoại', 'Laptop', 'Tai nghe', 'Tablet'].map((c) => (
                  <li key={c}><span className="hover:text-white cursor-pointer transition-colors">{c}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                {['Chính sách bảo hành', 'Đổi trả', 'Theo dõi đơn hàng', 'Liên hệ'].map((c) => (
                  <li key={c}><span className="hover:text-white cursor-pointer transition-colors">{c}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Liên hệ</h4>
              <div className="space-y-1 text-sm">
                <p>📞 1800 6789</p>
                <p>✉️ support@techstore.vn</p>
                <p>📍 TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm">© {new Date().getFullYear()} TechStore. All rights reserved.</p>
            <p className="text-xs">Made with ❤️ — MERN Stack · BTTuan04</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
