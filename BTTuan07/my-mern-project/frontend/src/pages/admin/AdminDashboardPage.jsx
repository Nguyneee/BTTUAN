import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign,
  Package, Clock, Truck, CheckCircle, XCircle, BarChart2, RefreshCw,
} from 'lucide-react';
import statsAPI from '../../api/stats.api';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', CANCEL_REQUESTED: 'Yêu cầu hủy',
};
const STATUS_COLORS = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
  SHIPPING: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444', CANCEL_REQUESTED: '#f97316',
};
const PIE_COLORS = ['#f59e0b','#3b82f6','#8b5cf6','#06b6d4','#10b981','#ef4444','#f97316'];

const RANGES = [
  { label: '7 ngày', days: 7 }, { label: '30 ngày', days: 30 },
  { label: '90 ngày', days: 90 }, { label: '12 tháng', days: 365, groupBy: 'month' },
];

function getDateRange(days) {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    groupBy: days <= 30 ? 'day' : days <= 90 ? 'week' : 'month',
  };
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color, growth, prefix = '' }) {
  const up = growth >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{prefix}{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {growth !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {up ? '+' : ''}{growth}% so kỳ trước
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {currency ? fmt(p.value) : fmtNum(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [rangeIdx, setRangeIdx] = useState(1); // 30 ngày mặc định
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [orderList, setOrderList] = useState({ data: [], pagination: {} });

  const range = RANGES[rangeIdx];
  const dateParams = getDateRange(range.days);
  if (range.groupBy) dateParams.groupBy = range.groupBy;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rev, cf, ord, cust, top] = await Promise.all([
        statsAPI.getOverview(),
        statsAPI.getRevenue(dateParams),
        statsAPI.getCashflow(dateParams),
        statsAPI.getOrders({ ...dateParams, limit: 8, page: 1 }),
        statsAPI.getCustomers(dateParams),
        statsAPI.getTopProducts({ ...dateParams, limit: 10 }),
      ]);
      setOverview(ov.data);
      setRevenue(rev.data);
      setCashflow(cf.data);
      setOrderStats(ord.data);
      setOrderList(ord.data?.list || { data: [], pagination: {} });
      setCustomers(cust.data);
      setTopProducts(top.data?.products || []);
    } catch (err) {
      console.error('Load stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [rangeIdx]); // eslint-disable-line

  const loadOrders = useCallback(async () => {
    try {
      const res = await statsAPI.getOrders({ ...dateParams, status: selectedStatus, page: orderPage, limit: 8 });
      setOrderList(res.data?.list || { data: [], pagination: {} });
    } catch (err) { console.error(err); }
  }, [selectedStatus, orderPage, rangeIdx]); // eslint-disable-line

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const pieData = orderStats?.byStatus?.filter((s) => s.count > 0) || [];

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary-600" /> Dashboard Thống kê
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGES.map((r, i) => (
            <button key={i} onClick={() => { setRangeIdx(i); setOrderPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rangeIdx === i ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {r.label}
            </button>
          ))}
          <button onClick={loadAll} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Overview Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Doanh thu tháng này" value={fmt(overview?.thisMonthRevenue)}
          icon={DollarSign} color="bg-emerald-500" growth={overview?.revenueGrowth} />
        <StatCard title="Tổng đơn hàng" value={fmtNum(overview?.totalOrders)}
          sub={`${fmtNum(overview?.todayOrders)} đơn hôm nay`} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Khách hàng" value={fmtNum(overview?.totalCustomers)}
          sub={`+${overview?.newCustomersToday || 0} hôm nay`} icon={Users} color="bg-purple-500" />
        <StatCard title="Đơn chờ xử lý" value={fmtNum(overview?.pendingOrders)}
          sub={`${fmtNum(overview?.shippingOrders)} đang giao`} icon={Clock} color="bg-amber-500" />
      </div>

      {/* ── Cashflow Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tiền đang trên đường giao', val: cashflow?.summary?.pendingAmount, cnt: cashflow?.summary?.pendingCount, icon: Truck, color: 'bg-cyan-500' },
          { label: 'Doanh thu đã nhận (đã giao)', val: cashflow?.summary?.receivedAmount, cnt: cashflow?.summary?.receivedCount, icon: CheckCircle, color: 'bg-emerald-500' },
          { label: 'Đơn bị hủy (mất doanh thu)', val: cashflow?.summary?.cancelledAmount, cnt: cashflow?.summary?.cancelledCount, icon: XCircle, color: 'bg-red-500' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4">
            <div className={`p-3 rounded-xl ${c.color} flex-shrink-0`}><c.icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{fmt(c.val)}</p>
              <p className="text-xs text-gray-400">{fmtNum(c.cnt)} đơn hàng</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ───────────────────────────────────────────────── */}
      <Section title={`📈 Doanh thu & Số đơn — ${range.label} qua`}>
        {revenue?.chart?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenue.chart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip currency />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Số đơn" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">Không có dữ liệu trong khoảng thời gian này</div>
        )}
      </Section>

      {/* ── Orders by Status + Pie ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Pie chart */}
        <div className="lg:col-span-2">
          <Section title="🥧 Tỷ lệ trạng thái đơn">
            {pieData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((entry, i) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [fmtNum(v), STATUS_LABELS[name] || name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {pieData.map((s) => (
                    <div key={s.status} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.status] || '#94a3b8' }} />
                      <span className="text-gray-600 truncate">{STATUS_LABELS[s.status]}</span>
                      <span className="font-bold text-gray-900 ml-auto">{fmtNum(s.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
            )}
          </Section>
        </div>

        {/* Status table + order list */}
        <div className="lg:col-span-3">
          <Section title="📋 Danh sách đơn hàng"
            action={
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setOrderPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400">
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Mã đơn</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Khách hàng</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500">Tổng tiền</th>
                    <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orderList.data?.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">Không có đơn hàng</td></tr>
                  ) : orderList.data?.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-2 font-mono text-xs text-primary-600 font-semibold">{o.orderCode}</td>
                      <td className="py-2.5 px-2 text-gray-700 truncate max-w-[100px]">{o.user?.username || '—'}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-900">{fmt(o.totalAmount)}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {orderList.pagination?.pages > 1 && (
              <div className="flex gap-1 mt-4 justify-end">
                {Array.from({ length: orderList.pagination.pages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => setOrderPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium ${orderPage === pg ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* ── Cashflow Chart ──────────────────────────────────────────────── */}
      <Section title="💰 Biểu đồ dòng tiền — Đang giao vs Đã giao">
        {cashflow?.chart?.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cashflow.chart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip currency />} />
              <Legend />
              <Bar dataKey="pendingAmount" name="Đang giao (tiền chờ)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="receivedAmount" name="Đã giao (doanh thu)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
        )}
      </Section>

      {/* ── New Customers Chart + Top Products ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customers */}
        <Section title="👥 Khách hàng mới">
          {customers?.chart?.length > 0 ? (
            <>
              <div className="flex gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{fmtNum(customers.summary?.totalNew)}</p>
                  <p className="text-xs text-gray-500">Khách mới trong kỳ</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmtNum(customers.summary?.totalCustomers)}</p>
                  <p className="text-xs text-gray-500">Tổng khách hàng</p>
                </div>
                <div className={`text-center ${customers.summary?.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  <p className="text-2xl font-bold">{customers.summary?.growth >= 0 ? '+' : ''}{customers.summary?.growth}%</p>
                  <p className="text-xs opacity-70">So kỳ trước</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={customers.chart} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Khách mới" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
          )}
        </Section>

        {/* Top Products */}
        <Section title="🏆 Top 10 sản phẩm bán chạy nhất">
          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
            ) : topProducts.map((p) => {
              const maxSold = topProducts[0]?.totalSold || 1;
              const pct = Math.round((p.totalSold / maxSold) * 100);
              return (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={`w-6 text-center text-xs font-bold flex-shrink-0 ${p.rank <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                    #{p.rank}
                  </span>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{fmtNum(p.totalSold)} sản phẩm</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">{fmt(p.totalRevenue)}</span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}
