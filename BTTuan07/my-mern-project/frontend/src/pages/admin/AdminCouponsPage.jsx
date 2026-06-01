import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ToggleLeft, ToggleRight, Edit, X, Calendar, DollarSign, Percent, User, Ticket } from 'lucide-react';
import couponAPI from '../../api/coupon.api';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // null = create mode
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'PERCENT',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: 1,
    startDate: '',
    endDate: '',
    targetUser: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  const fetchCoupons = () => {
    setLoading(true);
    couponAPI.getAllCoupons({ page, limit: 10, search })
      .then((res) => {
        setCoupons(res.data || []);
        setTotalPages(res.pagination?.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, search]);

  const handleToggleActive = async (id) => {
    try {
      await couponAPI.toggleActive(id);
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await couponAPI.delete(id);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setForm({
      code: '',
      description: '',
      type: 'PERCENT',
      value: 0,
      minOrderAmount: 0,
      maxDiscountAmount: '',
      usageLimit: '',
      usageLimitPerUser: 1,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      targetUser: '',
      isActive: true,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditId(c._id);
    setForm({
      code: c.code,
      description: c.description || '',
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || '',
      usageLimit: c.usageLimit || '',
      usageLimitPerUser: c.usageLimitPerUser || 1,
      startDate: c.startDate ? c.startDate.substring(0, 10) : '',
      endDate: c.endDate ? c.endDate.substring(0, 10) : '',
      targetUser: c.targetUser || '',
      isActive: c.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.code.trim()) return setFormError('Vui lòng nhập mã coupon');
    if (form.value <= 0) return setFormError('Giá trị giảm phải lớn hơn 0');
    if (!form.endDate) return setFormError('Vui lòng chọn ngày hết hạn');

    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      targetUser: form.targetUser.trim() || null,
    };

    try {
      if (editId) {
        await couponAPI.update(editId, payload);
      } else {
        await couponAPI.create(payload);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary-600" /> Mã giảm giá (Coupons)
          </h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các chương trình khuyến mãi và mã ưu đãi</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã coupon..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Coupon List Table */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Không tìm thấy mã giảm giá nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Mã / Mô tả</th>
                  <th className="px-6 py-4">Loại / Giá trị</th>
                  <th className="px-6 py-4">Giới hạn đơn</th>
                  <th className="px-6 py-4">Lượt dùng</th>
                  <th className="px-6 py-4">Hạn dùng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => {
                  const isExpired = new Date(c.endDate) < new Date();
                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                            {c.code}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{c.description || 'Không có mô tả'}</p>
                          {c.createdBy === 'system' && (
                            <span className="inline-block bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
                              Đổi từ điểm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {c.type === 'PERCENT' ? `${c.value}%` : formatPrice(c.value)}
                        </span>
                        {c.type === 'PERCENT' && c.maxDiscountAmount && (
                          <p className="text-[10px] text-gray-400 mt-0.5">Tối đa: {formatPrice(c.maxDiscountAmount)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        Tối thiểu: {formatPrice(c.minOrderAmount)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {c.usageCount} / {c.usageLimit || '∞'}
                        <p className="text-[10px] text-gray-400 mt-0.5">Mỗi user: {c.usageLimitPerUser} lượt</p>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <p className="text-gray-600">{new Date(c.startDate).toLocaleDateString('vi-VN')}</p>
                        <p className={`font-semibold mt-0.5 ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                          đến {new Date(c.endDate).toLocaleDateString('vi-VN')} {isExpired && '(Hết hạn)'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(c._id)}
                          className="focus:outline-none transition-colors"
                        >
                          {c.isActive ? (
                            <ToggleRight className="w-9 h-9 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <ToggleLeft className="w-9 h-9 text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Trang {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-950 text-lg flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary-600" />
                {editId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mã Coupon *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editId}
                    placeholder="SALE20"
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none uppercase"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Loại Giảm *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VND)</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Giá trị giảm * ({form.type === 'PERCENT' ? '%' : 'VND'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.value}
                    onChange={(e) => setForm((prev) => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Min Order Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Max Discount (only for PERCENT) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={form.type !== 'PERCENT'}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    placeholder="Không giới hạn"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none disabled:bg-gray-50"
                  />
                </div>

                {/* Target User */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mã User nhận (tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Để trống nếu là mã công khai"
                    value={form.targetUser}
                    onChange={(e) => setForm((prev) => ({ ...prev, targetUser: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Total Usage Limit */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tổng lượt dùng giới hạn</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="Không giới hạn"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Usage Limit per user */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lượt dùng mỗi user</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm((prev) => ({ ...prev, usageLimitPerUser: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày hết hạn *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả chương trình</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Mô tả ưu đãi..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 rounded-xl text-sm font-bold"
                >
                  {editId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
