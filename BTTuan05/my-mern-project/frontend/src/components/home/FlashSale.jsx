import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(targetMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((p) => Math.max(0, p - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return { h, m, s };
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-white text-red-600 rounded-lg flex items-center justify-center text-lg font-black shadow-sm">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-red-200 text-xs mt-0.5">{label}</span>
    </div>
  );
}

export default function FlashSale({ products = [] }) {
  // Countdown: 6 hours from now
  const { h, m, s } = useCountdown(6 * 3_600_000);
  const saleProducts = products.filter((p) => p.discount > 0).slice(0, 6);

  return (
    <section className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <h2 className="text-white font-black text-xl">Flash Sale</h2>
          <span className="text-red-200 text-sm font-medium hidden sm:block">Kết thúc sau</span>
          <div className="flex items-center gap-1">
            <TimeBox value={h} label="Giờ" />
            <span className="text-white font-black mb-4">:</span>
            <TimeBox value={m} label="Phút" />
            <span className="text-white font-black mb-4">:</span>
            <TimeBox value={s} label="Giây" />
          </div>
        </div>
        <Link
          to="/search?onSale=true"
          className="flex items-center gap-1 text-white text-sm font-semibold hover:text-red-100 transition-colors"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Products scroll */}
      <div className="px-5 pb-5 overflow-x-auto">
        {saleProducts.length > 0 ? (
          <div className="flex gap-3 min-w-0" style={{ minWidth: `${saleProducts.length * 180}px` }}>
            {saleProducts.map((product) => (
              <div key={product._id} className="w-44 shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-red-200">
            Đang tải sản phẩm flash sale...
          </div>
        )}
      </div>
    </section>
  );
}
