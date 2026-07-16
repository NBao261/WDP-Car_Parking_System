import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, FileText } from 'lucide-react';
import {
  exceptionService,
  IException,
//   ExceptionType,
  ExceptionStatus,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
} from '../../../services/exception.service';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
// import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table';
import { ExceptionReviewModal } from '../exceptionsManager/components/ExceptionReviewModal';
import { toast } from 'sonner';

const getStatusColor = (status: ExceptionStatus) => {
  switch (status) {
    case ExceptionStatus.NEW:
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case ExceptionStatus.PROCESSING:
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case ExceptionStatus.RESOLVED:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case ExceptionStatus.REJECTED:
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export function ExceptionWidget({ facilityId }: { facilityId?: string }) {
  const [exceptions, setExceptions] = useState<IException[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const [selectedException, setSelectedException] = useState<IException | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    } else if (sortDir === (field === 'createdAt' ? 'desc' : 'asc')) {
      setSortDir(field === 'createdAt' ? 'asc' : 'desc');
    } else {
      setSortField('createdAt');
      setSortDir('desc');
    }
  };

  const fetchExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (facilityId && facilityId !== 'all') params.facilityId = facilityId;
      const res: any = await exceptionService.getExceptions(params);
      if (res.success) {
        const listData = Array.isArray(res.data) ? res.data : res.data?.data;
        setExceptions(listData || []);
        setTotalPages(res.pagination?.totalPages || res.data?.totalPages || 1);
      } else {
        setExceptions([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch exceptions', err);
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, facilityId]);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  useEffect(() => {
    setPage(1);
  }, [facilityId, statusFilter]);

  const handleReviewSubmit = async (exceptionId: string, managerNote: string) => {
    setIsSubmitting(true);
    try {
      const res = await exceptionService.addManagerReview(exceptionId, { managerNote });
      if (res.success) {
        toast.success('Đã lưu đánh giá ngoại lệ');
        setIsModalOpen(false);
        fetchExceptions(); // Reload list
      } else {
        toast.error(res.message || 'Lỗi khi lưu đánh giá');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client-side search filtering
  const filteredExceptions = search
    ? exceptions.filter((ex) => {
        const sessionCode =
          typeof ex.sessionId === 'object' && ex.sessionId ? ex.sessionId.code : '';
        const licensePlate =
          typeof ex.sessionId === 'object' && ex.sessionId ? ex.sessionId.licensePlate : '';
        return (
          sessionCode?.toLowerCase().includes(search.toLowerCase()) ||
          licensePlate?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : exceptions;

  const sortedExceptions = [...filteredExceptions].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    if (sortField === 'sessionId') {
      aVal = typeof a.sessionId === 'object' && a.sessionId ? a.sessionId.code || '' : '';
      bVal = typeof b.sessionId === 'object' && b.sessionId ? b.sessionId.code || '' : '';
    } else if (sortField === 'licensePlate') {
      aVal = typeof a.sessionId === 'object' && a.sessionId ? a.sessionId.licensePlate || '' : '';
      bVal = typeof b.sessionId === 'object' && b.sessionId ? b.sessionId.licensePlate || '' : '';
    } else if (sortField === 'staffId') {
      aVal = typeof a.staffId === 'object' && a.staffId ? a.staffId.name || '' : '';
      bVal = typeof b.staffId === 'object' && b.staffId ? b.staffId.name || '' : '';
    } else if (sortField === 'createdAt') {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    } else {
      aVal = (a as any)[sortField] || '';
      bVal = (b as any)[sortField] || '';
    }

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Sự cố</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Theo dõi các sự cố tại bãi đỗ xe</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm mã lượt gửi, biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#86cd3d]/50 w-[200px] transition-colors"
            />
          </div>
          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#86cd3d]/50 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={ExceptionStatus.NEW}>Mới</option>
            <option value={ExceptionStatus.PROCESSING}>Đang xử lý</option>
            <option value={ExceptionStatus.RESOLVED}>Đã giải quyết</option>
            <option value={ExceptionStatus.REJECTED}>Từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-5 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-[#86cd3d]" />
          </div>
        ) : filteredExceptions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-gray-400">Chưa có dữ liệu sự cố</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#9FE870] text-[#062F28] text-[13px] border-b border-[#9FE870] font-semibold uppercase tracking-wider">
              <tr>
                <th
                  className="px-6 py-4 rounded-tl-2xl w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('sessionId')}
                >
                  <span className="flex items-center gap-1.5">
                    Mã lượt gửi
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'sessionId' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'sessionId' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('licensePlate')}
                >
                  <span className="flex items-center gap-1.5">
                    Xe
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'licensePlate' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'licensePlate' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('type')}
                >
                  <span className="flex items-center gap-1.5">
                    Loại ngoại lệ
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'type' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'type' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('staffId')}
                >
                  <span className="flex items-center gap-1.5">
                    Người tạo
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'staffId' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'staffId' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <span className="flex items-center gap-1.5">
                    Ngày tạo
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'createdAt' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'createdAt' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'desc' ? '↓ Mới' : '↑ Cũ'}
                      </span>
                    )}
                  </span>
                </th>
                <th
                  className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                  onClick={() => toggleSort('status')}
                >
                  <span className="flex items-center gap-1.5">
                    Trạng thái
                    <ArrowUpDown
                      size={14}
                      className={sortField === 'status' ? 'text-white' : 'text-[#062F28]/40'}
                    />
                    {sortField === 'status' && (
                      <span className="text-[10px] text-white font-bold">
                        {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
                      </span>
                    )}
                  </span>
                </th>
                <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {sortedExceptions.map((ex) => {
                  const sessionCode =
                    typeof ex.sessionId === 'object' && ex.sessionId
                      ? ex.sessionId.code
                      : ex.sessionId || 'N/A';
                  const licensePlate =
                    typeof ex.sessionId === 'object' && ex.sessionId
                      ? ex.sessionId.licensePlate
                      : '';
                  const staffName =
                    typeof ex.staffId === 'object' && ex.staffId
                      ? ex.staffId.name
                      : ex.staffId || 'Hệ thống';

                  return (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={ex._id}
                      className="hover:bg-[#9FE870]/10 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{sessionCode}</td>
                      <td className="px-6 py-4 text-gray-700">{licensePlate || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-[12px]">
                          {EXCEPTION_TYPE_LABELS[ex.type]}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-[12px]">{staffName}</td>
                      <td className="px-6 py-4 text-gray-600 text-[12px]">
                        {new Date(ex.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(ex.status)}`}
                        >
                          {EXCEPTION_STATUS_LABELS[ex.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedException(ex);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FileText size={16} />
                          Xem lại
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 flex-shrink-0">
          <span className="text-[12px] text-gray-400">
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 text-[12px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 text-[12px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {selectedException && (
        <ExceptionReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exception={selectedException}
          onSubmitReview={handleReviewSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
