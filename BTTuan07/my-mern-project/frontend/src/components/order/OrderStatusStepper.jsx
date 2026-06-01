import { Check } from 'lucide-react';
import { ORDER_STATUS } from './orderStatusConfig';

// Step labels in order
const STEPS = [
  { key: ORDER_STATUS.PENDING, label: 'Đơn hàng mới' },
  { key: ORDER_STATUS.CONFIRMED, label: 'Đã xác nhận' },
  { key: ORDER_STATUS.PROCESSING, label: 'Đang chuẩn bị' },
  { key: ORDER_STATUS.SHIPPING, label: 'Đang giao' },
  { key: ORDER_STATUS.DELIVERED, label: 'Đã giao' },
];

export default function OrderStatusStepper({ currentStatus }) {
  // Cancelled or cancel requested: show special view
  if (currentStatus === ORDER_STATUS.CANCELLED) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-3 text-center">
          <p className="text-red-700 font-bold text-base">Đơn hàng đã bị hủy</p>
          <p className="text-red-500 text-xs mt-0.5">Đơn hàng này không còn được xử lý</p>
        </div>
      </div>
    );
  }

  if (currentStatus === ORDER_STATUS.CANCEL_REQUESTED) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="bg-gray-50 border border-gray-300 rounded-2xl px-6 py-3 text-center">
          <p className="text-gray-700 font-bold text-base">Yêu cầu hủy đơn</p>
          <p className="text-gray-500 text-xs mt-0.5">Shop đang xem xét yêu cầu hủy của bạn</p>
        </div>
      </div>
    );
  }

  // Get step index
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const isDelivered = currentStatus === ORDER_STATUS.DELIVERED;

  return (
    <div className="py-4">
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" />

        {/* Active progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-semibold text-center leading-tight max-w-[80px] ${
                  isCompleted || isCurrent ? 'text-emerald-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-200'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isCompleted || isCurrent ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-0.5 ${
                      index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
