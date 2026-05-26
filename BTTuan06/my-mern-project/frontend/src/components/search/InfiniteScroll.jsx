import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function InfiniteScroll({ onLoadMore, hasMore = true, loading = false, children }) {
  const sentinelRef = useRef(null);
  const [observerActive, setObserverActive] = useState(true);

  useEffect(() => {
    if (!hasMore || !observerActive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loading, observerActive]);

  useEffect(() => {
    setObserverActive(true);
  }, [children]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Dang tai them san pham...</span>
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-sm text-gray-400">— Da hien thi tat ca san pham —</p>
        )}
      </div>
    </div>
  );
}
