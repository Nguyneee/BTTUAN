import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * StockBadge — Displays stock status with color-coded indicator.
 */
export default function StockBadge({ stock = 0 }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-1.5 text-red-600">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Hết hàng</span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-1.5 text-orange-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Còn {stock} sản phẩm (sắp hết)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-emerald-600">
      <CheckCircle className="w-4 h-4" />
      <span className="text-sm font-semibold">Còn hàng ({stock} sản phẩm)</span>
    </div>
  );
}
