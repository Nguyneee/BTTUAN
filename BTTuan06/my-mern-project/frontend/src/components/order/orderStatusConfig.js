// Order status configuration
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  CANCEL_REQUESTED: 'CANCEL_REQUESTED',
};

export const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: 'Đơn hàng mới',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    bgLight: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgLight: 'bg-blue-50',
    dot: 'bg-blue-400',
  },
  [ORDER_STATUS.PROCESSING]: {
    label: 'Đang chuẩn bị',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgLight: 'bg-orange-50',
    dot: 'bg-orange-400',
  },
  [ORDER_STATUS.SHIPPING]: {
    label: 'Đang giao hàng',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgLight: 'bg-purple-50',
    dot: 'bg-purple-400',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Đã giao thành công',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgLight: 'bg-emerald-50',
    dot: 'bg-emerald-400',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    bgLight: 'bg-red-50',
    dot: 'bg-red-400',
  },
  [ORDER_STATUS.CANCEL_REQUESTED]: {
    label: 'Yêu cầu hủy',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    bgLight: 'bg-gray-50',
    dot: 'bg-gray-400',
  },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[ORDER_STATUS.PENDING];
}
