import { useState, useEffect } from 'react';
import { Gift, Star, TrendingUp, Clock, Tag } from 'lucide-react';
import reviewAPI from '../api/review.api';
import couponAPI from '../api/coupon.api';

const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);
const fmtPrice = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function LoyaltyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState(null); // stores option id currently exchanging
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = () => {
    reviewAPI.getMyPoints()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExchange = async (option) => {
    setErrorMsg('');
    setMessage('');
    setExchanging(option);
    try {
      const res = await couponAPI.exchangePoints(option);
      setMessage(res.message || 'Đổi mã giảm giá thành công!');
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Có lỗi xảy ra khi đổi điểm');
    } finally {
      setExchanging(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const points = data?.loyaltyPoints || 0;
  const history = data?.history || [];

  const exchangeOptions = [
    { id: '500', points: 500, value: 50000, desc: 'Đơn tối thiểu 75k VND', tag: 'Voucher 50K' },
    { id: '1000', points: 1000, value: 120000, desc: 'Đơn tối thiểu 180k VND', tag: 'Voucher 120K' },
    { id: '2000', points: 2000, value: 250000, desc: 'Đơn tối thiểu 375k VND', tag: 'Voucher 250K' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-500" /> Kho điểm tích lũy
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tích điểm qua đánh giá sản phẩm để đổi mã ưu đãi hấp dẫn</p>
      </div>

      {/* Points Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative">
          <p className="text-amber-100 text-sm font-medium mb-1">Tổng điểm tích lũy hiện tại</p>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black">{fmtNum(points)}</span>
            <span className="text-2xl text-amber-200 mb-2">điểm</span>
          </div>
          <p className="text-amber-100 text-sm mt-3">
            💡 Mỗi đánh giá sản phẩm nhận ngay <strong>50 điểm</strong>. Tích điểm và đổi mã ưu đãi bên dưới.
          </p>
        </div>
      </div>

      {/* Point Exchange Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-500" /> Đổi quà tặng ưu đãi
        </h2>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          {exchangeOptions.map((opt) => {
            const canExchange = points >= opt.points;
            const isThisExchanging = exchanging === opt.id;

            return (
              <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-2xl hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl font-bold text-lg flex-shrink-0">
                    🏷️
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{opt.tag}</h3>
                    <p className="text-xs text-gray-400 font-medium">Yêu cầu: {opt.points} điểm • {opt.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleExchange(opt.id)}
                  disabled={!canExchange || exchanging !== null}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center min-w-[100px]
                    ${canExchange
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isThisExchanging ? 'Đang đổi...' : 'Đổi ngay'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" /> Cách tích điểm
        </h2>
        <div className="space-y-3">
          {[
            { icon: '⭐', title: 'Đánh giá sản phẩm', desc: 'Đánh giá sản phẩm đã mua thành công', pts: '+50 điểm' },
            { icon: '🛒', title: 'Mua hàng thường xuyên', desc: 'Tích điểm tự động sau mỗi giao dịch', pts: 'Biến động' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> Lịch sử điểm
          </h2>
        </div>
        {history.length === 0 ? (
          <div className="py-12 text-center">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Chưa có lịch sử tích điểm</p>
            <p className="text-gray-400 text-xs mt-1">Hãy đánh giá sản phẩm để nhận điểm!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${h.type === 'EARN' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                  {h.type === 'EARN' ? '+' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{h.reason}</p>
                  <p className="text-xs text-gray-400">{timeAgo(h.createdAt)}</p>
                </div>
                <span className={`font-bold text-sm ${h.type === 'EARN' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {h.type === 'EARN' ? '+' : '-'}{fmtNum(h.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
