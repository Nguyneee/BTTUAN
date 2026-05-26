import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const PLACEHOLDER = 'https://via.placeholder.com/600x600?text=No+Image';

export default function ImageSwiper({ images = [], productName = '' }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const validImages = images.length > 0 ? images : [PLACEHOLDER];

  return (
    <div className="flex flex-col gap-3">
      {/* Main swiper */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="aspect-square"
          loop={validImages.length > 1}
        >
          {validImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`${productName} ${idx + 1}`}
                className="w-full h-full object-contain p-4"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails (only show if > 1 image) */}
      {validImages.length > 1 && (
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(validImages.length, 4)}
          freeMode
          watchSlidesProgress
          className="w-full"
        >
          {validImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-transparent cursor-pointer hover:border-primary-400 transition-colors">
                <img
                  src={src}
                  alt={`thumb-${idx}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
