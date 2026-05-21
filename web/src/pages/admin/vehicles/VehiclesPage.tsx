import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Search, RefreshCw, Package, ChevronLeft, ChevronRight, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { vehicleTypeService, VehicleType, SlotSize } from '../../../services/vehicleType.service';
import { floorService, Floor } from '../../../services/floor.service';
import { facilityService, Facility } from '../../../services/facility.service';
import { VehicleFormModal } from './components/VehicleFormModal';
import { VehicleRow } from './components/VehicleRow';
import { VehicleDetailModal } from './components/VehicleDetailModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterSize, setFilterSize] = useState<SlotSize | 'all'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState<VehicleType | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<VehicleType | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkedFloors, setLinkedFloors] = useState<{ floor: Floor, facilityName: string }[] | null>(null);
  const [isCheckingLinks, setIsCheckingLinks] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await vehicleTypeService.getAll({ limit: 1000 });
      setVehicles(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Tải danh sách loại xe thất bại');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterSize]);

  // Filter Logic
  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.code.toLowerCase().includes(search.toLowerCase());
    const matchesSize = filterSize === 'all' || v.slotSize === filterSize;
    return matchesSearch && matchesSize;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVehicles = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (v: VehicleType) => { setSelected(v); setIsModalOpen(true); };
  const handleView = (v: VehicleType) => { setSelected(v); setIsDetailOpen(true); };
  const handleAdd = () => { setSelected(undefined); setIsModalOpen(true); };

  const handleDeleteClick = async (v: VehicleType) => {
    setDeleteTarget(v);
    setIsCheckingLinks(true);
    setLinkedFloors(null);
    try {
      const [floorsRes, facilitiesRes] = await Promise.all([
        floorService.getAll({ limit: 1000 }),
        facilityService.getAll({ limit: 1000 })
      ]);
      const facMap = Object.fromEntries(facilitiesRes.data.map((f: Facility) => [f._id, f.name]));

      const linked = floorsRes.data.filter((fl: Floor) =>
        fl.allowedVehicleTypes.some((vt: any) => (typeof vt === 'string' ? vt : vt._id) === v._id)
      ).map((fl: Floor) => ({
        floor: fl,
        facilityName: facMap[typeof fl.facilityId === 'string' ? fl.facilityId : (fl.facilityId as any)?._id] || 'Bãi Xe Không Xác Định'
      }));
      setLinkedFloors(linked);
    } catch (e) {
      console.error('Failed to fetch links', e);
      setLinkedFloors([]);
    } finally {
      setIsCheckingLinks(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await vehicleTypeService.softDelete(deleteTarget._id);
      toast.success(`Đã xóa "${deleteTarget.name}"`);
      setDeleteTarget(undefined);
      fetchVehicles();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('assigned to floors')) {
        toast.error('Không thể xóa: Loại xe này đang được sử dụng ở một hoặc nhiều tầng.');
      } else {
        toast.error(msg || 'Xóa thất bại');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const countBySize = (size: SlotSize) => vehicles.filter((v) => v.slotSize === size).length;

  return (
    <motion.div className="space-y-6 max-w-[1400px] mx-auto pb-12" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Loại Xe</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các loại phương tiện được hỗ trợ trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAdd}
            className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={20} /> Thêm Loại Xe
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Số Loại', value: vehicles.length, bg: 'bg-lime-50 text-lime-700 border border-lime-200/60' },
          { label: 'Slot Nhỏ', value: countBySize('small'), bg: 'bg-blue-50 text-blue-700 border border-blue-200/60' },
          { label: 'Slot Vừa', value: countBySize('medium'), bg: 'bg-amber-50 text-amber-700 border border-amber-200/60' },
          { label: 'Slot Lớn', value: countBySize('large'), bg: 'bg-purple-50 text-purple-700 border border-purple-200/60' },
        ].map(({ label, value, bg }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-1">{isLoading ? '—' : value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm theo tên hoặc mã..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value as SlotSize | 'all')}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all appearance-none"
            >
              <option value="all">Tất Cả Kích Thước</option>
              <option value="small">Nhỏ</option>
              <option value="medium">Vừa</option>
              <option value="large">Lớn</option>
            </select>
          </div>
          <button
            onClick={fetchVehicles}
            title="Làm mới"
            className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl w-[25%]">Loại Xe</th>
                <th className="px-6 py-4 w-[15%]">Kích Thước Slot</th>
                <th className="px-6 py-4 w-[40%]">Mô Tả</th>
                <th className="px-6 py-4 w-[15%]">Ngày Tạo</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl w-[5%]">Thao Tác</th>
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
              ) : paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package size={22} className="text-gray-300" />
                    </div>
                    {search || filterSize !== 'all' ? 'Không tìm thấy loại xe nào phù hợp với bộ lọc' : 'Chưa có loại xe nào'}
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v, idx) => (
                  <VehicleRow
                    key={v._id}
                    vehicle={v}
                    onEdit={() => handleEdit(v)}
                    onView={() => handleView(v)}
                    onDelete={() => handleDeleteClick(v)}
                    isLast={idx >= paginatedVehicles.length - 2 && paginatedVehicles.length > 3}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> trong tổng số <span className="font-medium text-gray-900">{filtered.length}</span> kết quả
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                      ? 'bg-[#d7ee46] text-[#060606] border border-[#c4dc32] font-bold'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <VehicleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicle={selected} onSuccess={fetchVehicles} />
      <VehicleDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} vehicle={selected} />

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(undefined)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-[#060606] mb-2">Xác Nhận Xóa</h2>
              <p className="text-sm text-gray-600 mb-3">Bạn có chắc chắn muốn xóa loại xe <strong>"{deleteTarget.name}"</strong>? Hành động này không thể hoàn tác.</p>

              <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl mb-6 flex gap-2.5 text-orange-800 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Lưu ý: Không thể xóa loại xe nếu nó đang được phân công cho bất kỳ tầng đỗ xe nào.</p>
                  {isCheckingLinks ? (
                    <div className="flex items-center gap-2 text-orange-600 mt-2">
                      <Loader2 size={12} className="animate-spin" /> <span className="text-xs">Đang kiểm tra liên kết...</span>
                    </div>
                  ) : linkedFloors && linkedFloors.length > 0 ? (
                    <div className="mt-2 text-xs">
                      <p className="text-orange-700 font-medium mb-1">Hiện đang được phân công tại:</p>
                      <ul className="list-disc pl-4 space-y-0.5 opacity-90 max-h-24 overflow-y-auto">
                        {linkedFloors.map((item) => (
                          <li key={item.floor._id}>
                            <strong>{item.floor.name}</strong> — {item.facilityName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : linkedFloors && linkedFloors.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium mt-1">✓ Có thể xóa an toàn (Chưa được phân công cho tầng nào)</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(undefined)} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
                <button onClick={confirmDelete} disabled={isDeleting || (linkedFloors !== null && linkedFloors.length > 0)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isDeleting && <Loader2 size={14} className="animate-spin" />} Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
