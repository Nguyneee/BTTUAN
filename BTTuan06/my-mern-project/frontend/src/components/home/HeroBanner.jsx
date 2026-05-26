import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max',
    subtitle: 'Khung titan. Chip A17 Pro. Camera 48MP.',
    cta: 'Mua ngay',
    ctaLink: '/search?q=iphone+15',
    badge: 'Giảm đến 15%',
    bg: 'from-slate-900 via-primary-900 to-primary-800',
    accent: '#38bdf8',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
  },
  {
    id: 2,
    title: 'MacBook Pro M3 Max',
    subtitle: 'Hiệu năng đỉnh cao. Sáng tạo không giới hạn.',
    cta: 'Khám phá',
    ctaLink: '/search?category=laptop',
    badge: 'Siêu phẩm 2024',
    bg: 'from-gray-900 via-gray-800 to-primary-900',
    accent: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
  },
  {
    id: 3,
    title: 'Flash Sale cuối tuần',
    subtitle: 'Giảm đến 25% hàng trăm sản phẩm công nghệ chính hãng.',
    cta: 'Xem khuyến mãi',
    ctaLink: '/search?onSale=true',
    badge: '⚡ Flash Sale',
    bg: 'from-red-900 via-rose-800 to-orange-800',
    accent: '#f97316',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const slide = slides[current];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bg} text-white transition-all duration-700`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-16 flex flex-col sm:flex-row items-center gap-8">
        {/* Text content */}
        <div className="flex-1 animate-fade-in z-10">
          <span
            className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: `${slide.accent}33`, color: slide.accent }}
          >
            {slide.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
            {slide.title}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-6 max-w-md">{slide.subtitle}</p>
          <Link
            to={slide.ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: slide.accent, color: '#000' }}
          >
            {slide.cta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product image */}
        <div className="flex-1 flex justify-center items-center max-w-xs sm:max-w-sm">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full max-h-56 object-contain drop-shadow-2xl animate-fade-in"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
