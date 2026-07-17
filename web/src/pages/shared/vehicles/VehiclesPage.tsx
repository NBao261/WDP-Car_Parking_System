import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowUpDown,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { vehicleTypeService, VehicleType } from '../../../services/vehicleType.service';
import { floorService, Floor } from '../../../services/floor.service';
import { facilityService, Facility } from '../../../services/facility.service';
import { VehicleFormModal } from './components/VehicleFormModal';
import { VehicleRow } from './components/VehicleRow';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { PageLoader } from '../../../components/PageLoader';
import React from 'react';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState<VehicleType | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<VehicleType | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  type SortField = 'name' | 'code' | 'createdAt' | 'none';
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filter & Sort Logic
  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.code.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (sortField === 'none') return 0;

    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'name' || sortField === 'code') {
      aVal = aVal?.toLowerCase() || '';
      bVal = bVal?.toLowerCase() || '';
    } else if (sortField === 'createdAt') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVehicles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (v: VehicleType) => {
    setSelected(v);
    setIsModalOpen(true);
  };
  const handleView = (v: VehicleType) => {
    setSelected(v);
    setIsDetailOpen(true);
  };
  const handleAdd = () => {
    setSelected(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (v: VehicleType) => {
    setDeleteTarget(v);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const [floorsRes, facilitiesRes] = await Promise.all([
        floorService.getAll({ limit: 1000 }),
        facilityService.getAll({ limit: 1000 }),
      ]);
      const facMap = Object.fromEntries(facilitiesRes.data.map((f: Facility) => [f._id, f.name]));

      const linked = floorsRes.data
        .filter((fl: Floor) =>
          fl.allowedVehicleTypes.some(
            (vt: any) => (typeof vt === 'string' ? vt : vt._id) === deleteTarget._id
          )
        )
        .map((fl: Floor) => ({
          floor: fl,
          facilityName:
            facMap[
            typeof fl.facilityId === 'string' ? fl.facilityId : (fl.facilityId as any)?._id
            ] || 'Bãi Xe Không Xác Định',
        }));

      if (linked.length > 0) {
        toast.error(
          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-sm font-medium">
              Không thể xóa loại xe này vì đang được phân công cho (các) bãi đỗ xe sau:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-sm mt-1">
              {linked.map((item: any) => (
                <li key={item.floor._id}>
                  {item.floor.name} — {item.facilityName}
                </li>
              ))}
            </ul>
          </div>,
          { duration: 6000 }
        );
        setDeleteTarget(undefined);
        return;
      }

      await vehicleTypeService.softDelete(deleteTarget._id);
      toast.success(`Đã xóa "${deleteTarget.name}"`);
      setDeleteTarget(undefined);
      fetchVehicles();
    } catch (err: any) {
      const msg = err.message || '';
      toast.error(msg || 'Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <motion.div
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#062F28]">Loại Xe</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các loại phương tiện được hỗ trợ trong hệ thống
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <motion.div variants={itemVariants}>
          <PageLoader />
        </motion.div>
      ) : (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col"
      >
        <div className="w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#9FE870] text-[#062F28] text-[13px] border-b border-[#9FE870] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl w-[5%] text-center">STT</th>
                <th
                  className="px-6 py-4 w-[30%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => {
                    if (sortField !== 'name') { setSortField('name'); setSortDir('asc'); }
                    else if (sortDir === 'asc') setSortDir('desc');
                    else { setSortField('createdAt'); setSortDir('desc'); }
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    Loại Xe
                    <ArrowUpDown size={14} className={sortField === 'name' ? 'text-white' : 'text-[#062F28]/40'} />
                    {sortField === 'name' && (
                      <span className="text-[10px] text-white font-bold">{sortDir === 'asc' ? 'A-Z' : 'Z-A'}</span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[25%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => {
                    if (sortField !== 'code') { setSortField('code'); setSortDir('asc'); }
                    else if (sortDir === 'asc') setSortDir('desc');
                    else { setSortField('createdAt'); setSortDir('desc'); }
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    Mã Xe
                    <ArrowUpDown size={14} className={sortField === 'code' ? 'text-white' : 'text-[#062F28]/40'} />
                    {sortField === 'code' && (
                      <span className="text-[10px] text-white font-bold">{sortDir === 'asc' ? 'A-Z' : 'Z-A'}</span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[20%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => {
                    if (sortField !== 'createdAt') { setSortField('createdAt'); setSortDir('desc'); }
                    else if (sortDir === 'desc') setSortDir('asc');
                    else { setSortField('createdAt'); setSortDir('desc'); }
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    Ngày Giờ Tạo
                    <ArrowUpDown size={14} className={sortField === 'createdAt' ? 'text-white' : 'text-[#062F28]/40'} />
                    {sortField === 'createdAt' && (
                      <span className="text-[10px] text-white font-bold">{sortDir === 'desc' ? '↓ Mới' : '↑ Cũ'}</span>
                    )}
                  </span>
                </th>
                <th className="px-6 py-4 text-right rounded-tr-2xl w-[20%]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package size={22} className="text-gray-300" />
                    </div>
                    {search
                      ? 'Không tìm thấy loại xe nào phù hợp với bộ lọc'
                      : 'Chưa có loại xe nào'}
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v, idx) => (
                  <VehicleRow
                    key={v._id}
                    vehicle={v}
                    index={(currentPage - 1) * itemsPerPage + idx + 1}
                    globalIndex={Math.max(0, vehicles.findIndex((allV) => allV._id === v._id))}
                    onEdit={() => handleEdit(v)}
                    onView={() => handleView(v)}
                    onDelete={() => handleDeleteClick(v)}
                    isLast={idx >= paginatedVehicles.length - 2}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-lime-100/50 flex items-center justify-between bg-lime-50/50 rounded-b-2xl">
            <p className="text-sm text-gray-500">
              Hiển thị{' '}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              đến{' '}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              trong tổng số <span className="font-medium text-gray-900">{filtered.length}</span> kết
              quả
            </p>
            <div className="flex gap-1.5">
              {totalPages >= 5 && (
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                  title="Trang đầu"
                >
                  <ChevronsLeft size={16} />
                </button>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                title="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              {(() => {
                let pages: (number | string)[] = [];
                if (totalPages <= 4) {
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else if (currentPage <= 3) {
                  pages = [1, 2, 3, '...', totalPages];
                } else if (currentPage >= totalPages - 2) {
                  pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
                } else {
                  pages = [
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages,
                  ];
                }

                return pages.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => typeof p === 'number' && setCurrentPage(p)}
                    disabled={p === '...'}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === '...'
                      ? 'text-gray-400 bg-transparent cursor-default'
                      : currentPage === p
                        ? 'bg-[#9FE870] text-[#062F28] border border-[#9FE870]/70 font-bold shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {p}
                  </button>
                ));
              })()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                title="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
              {totalPages >= 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                  title="Trang cuối"
                >
                  <ChevronsRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
      )}

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selected}
        onSuccess={fetchVehicles}
      />
      <VehicleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        vehicle={selected}
        allVehicles={vehicles}
      />



    </motion.div>

      {createPortal(
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(undefined)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-lg font-bold text-[#060606] mb-2">Xác Nhận Xóa</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Bạn có chắc chắn muốn xóa loại xe <strong>"{deleteTarget.name}"</strong>? Hành động
                  này không thể hoàn tác.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(undefined)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting && <Loader2 size={14} className="animate-spin" />} Xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </>
  );
}
