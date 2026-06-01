import { Minus, Plus } from 'lucide-react';

/**
 * QuantitySelector — Increment/decrement quantity with min/max constraints.
 */
export default function QuantitySelector({ quantity, onchange, stock = 0 }) {
  const disabled = stock === 0;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onchange(Math.max(1, quantity - 1))}
        disabled={disabled || quantity <= 1}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-14 h-10 border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-900 text-base select-none">
        {disabled ? 0 : quantity}
      </div>

      <button
        onClick={() => onchange(Math.min(stock, quantity + 1))}
        disabled={disabled || quantity >= stock}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
      </button>

      {stock > 0 && (
        <span className="text-xs text-gray-400 ml-2">Còn {stock} sp</span>
      )}
    </div>
  );
}
