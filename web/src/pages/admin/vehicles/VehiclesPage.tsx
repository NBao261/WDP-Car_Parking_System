import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Car, Search, MoreVertical, Edit, Trash2,
  Loader2, RefreshCw, Package, X
} from 'lucide-react';
import {
  vehicleTypeService,
  VehicleType,
  SlotSize,
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
} from '../../../services/vehicleType.service';

// ── Common icon emojis for vehicle types ──
const ICON_OPTIONS = ['🚗', '🏍️', '🛵', '🚌', '🚚', '🚐', '🛺', '🚲', '🛴', '🚑'];

const SLOT_SIZE_LABELS: Record<SlotSize, { label: string; color: string }> = {
  small: { label: 'Nhỏ', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  medium: { label: 'Vừa', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  large: { label: 'Lớn', color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

// ── Form Modal ──────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  onSuccess: () => void;
}

function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess }: ModalProps) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<CreateVehicleTypePayload>({
    name: '', code: '', slotSize: 'medium', description: '', icon: '🚗',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setForm({ name: vehicle.name, code: vehicle.code, slotSize: vehicle.slotSize, description: vehicle.description || '', icon: vehicle.icon || '🚗' });
      } else {
        setForm({ name: '', code: '', slotSize: 'medium', description: '', icon: '🚗' });
      }
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit && vehicle) {
        const payload: UpdateVehicleTypePayload = { name: form.name, slotSize: form.slotSize, description: form.description, icon: form.icon };
        await vehicleTypeService.update(vehicle._id, payload);
        toast.success('Cập nhật loại xe thành công');
      } else {
        await vehicleTypeService.create(form);
        toast.success('Tạo loại xe thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">{isEdit ? 'Chỉnh sửa loại xe' : 'Thêm loại xe mới'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Cập nhật thông tin phương tiện' : 'Tạo danh mục loại phương tiện mới'}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Icon picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biểu tượng</label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 text-xl rounded-xl border-2 transition-all flex items-center justify-center ${form.icon === icon ? 'border-[#d7ee46] bg-[#d7ee46]/10 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                  >{icon}</button>
                ))}
              </div>
            </div>

            {/* Tên loại xe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên loại xe <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                placeholder="VD: Xe máy, Ô tô, Xe đạp..."
              />
            </div>

            {/* Mã loại xe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã loại xe <span className="text-red-500">*</span></label>
              <input type="text" required disabled={isEdit} value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                placeholder="VD: MOTORBIKE, CAR, BICYCLE"
              />
              {!isEdit && <p className="text-xs text-gray-400 mt-1">Mã không thể thay đổi sau khi tạo</p>}
            </div>

            {/* Kích thước slot */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kích thước slot <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SLOT_SIZE_LABELS) as SlotSize[]).map((size) => {
                  const { label, color } = SLOT_SIZE_LABELS[size];
                  return (
                    <button key={size} type="button"
                      onClick={() => setForm({ ...form, slotSize: size })}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${form.slotSize === size ? 'border-[#d7ee46] bg-[#d7ee46] text-[#060606] scale-[1.03]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                    >{label}</button>
                  );
                })}
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                placeholder="Mô tả ngắn về loại phương tiện..."
              />
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60">
                Hủy bỏ
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Lưu thay đổi' : 'Tạo loại xe'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Vehicle Row Card ─────────────────────────────────
function VehicleRow({ vehicle, onEdit, onRefresh }: { vehicle: VehicleType; onEdit: () => void; onRefresh: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { label, color } = SLOT_SIZE_LABELS[vehicle.slotSize] || { label: vehicle.slotSize, color: 'bg-gray-100 text-gray-600 border-gray-200' };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Xóa loại xe "${vehicle.name}"?`)) return;
    setLoading(true);
    try {
      await vehicleTypeService.softDelete(vehicle._id);
      toast.success(`Đã xóa "${vehicle.name}"`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Xóa thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-gray-50/50 transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl border border-gray-100">
            {vehicle.icon || '🚗'}
          </div>
          <div>
            <p className="font-semibold text-[#060606] text-sm">{vehicle.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{vehicle.code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>{label}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
        <span className="line-clamp-1">{vehicle.description || '—'}</span>
      </td>
      <td className="px-6 py-4 text-xs text-gray-400">
        {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="px-6 py-4 text-right relative">
        {loading ? (
          <div className="inline-flex w-8 h-8 items-center justify-center">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <button onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical size={18} />
          </button>
        )}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.12 }}
              className="absolute right-6 top-12 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-10">
              <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
              <button onClick={() => { onEdit(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Edit size={14} /> Chỉnh sửa
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} /> Xóa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
}

// ── Main Page ────────────────────────────────────────
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<VehicleType | undefined>();

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await vehicleTypeService.getAll({ limit: 100 });
      setVehicles(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách loại xe');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const filtered = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (v: VehicleType) => { setSelected(v); setIsModalOpen(true); };
  const handleAdd = () => { setSelected(undefined); setIsModalOpen(true); };

  // Count by slotSize
  const countBySize = (size: SlotSize) => vehicles.filter((v) => v.slotSize === size).length;

  return (
    <motion.div className="space-y-6 max-w-[1400px] mx-auto pb-12" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Quản lý Loại xe</h1>
          <p className="text-gray-500 text-sm mt-1">Danh mục phương tiện được hỗ trợ trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchVehicles} className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleAdd}
            className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={20} /> Thêm loại xe
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng loại xe', value: vehicles.length, bg: 'bg-[#060606] text-white' },
          { label: 'Slot nhỏ', value: countBySize('small'), bg: 'bg-blue-50 text-blue-700 border border-blue-200/60' },
          { label: 'Slot vừa', value: countBySize('medium'), bg: 'bg-amber-50 text-amber-700 border border-amber-200/60' },
          { label: 'Slot lớn', value: countBySize('large'), bg: 'bg-purple-50 text-purple-700 border border-purple-200/60' },
        ].map(({ label, value, bg }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-1">{isLoading ? '—' : value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm theo tên hoặc mã..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Loại phương tiện</th>
                <th className="px-6 py-4">Kích thước slot</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#d7ee46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package size={22} className="text-gray-300" />
                    </div>
                    {search ? 'Không tìm thấy loại xe phù hợp' : 'Chưa có loại xe nào'}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <VehicleRow key={v._id} vehicle={v} onEdit={() => handleEdit(v)} onRefresh={fetchVehicles} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <VehicleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicle={selected} onSuccess={fetchVehicles} />
    </motion.div>
  );
}
