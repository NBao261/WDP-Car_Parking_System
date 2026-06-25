import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertCircle,
  FileText,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  exceptionService,
  IException,
  ExceptionType,
  ExceptionStatus,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
} from '../../../services/exception.service';
import { ExceptionFilterBar } from './components/ExceptionFilterBar';
import { ExceptionReviewModal } from './components/ExceptionReviewModal';

export default function ExceptionsManagerPage() {
  const [exceptions, setExceptions] = useState<IException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ExceptionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ExceptionStatus | 'all'>('all');
  const [sortValue, setSortValue] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Review Modal state
  const [selectedException, setSelectedException] = useState<IException | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExceptions();
  }, [page, filterType, filterStatus, sortValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (page === 1) fetchExceptions();
      else setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchExceptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sortBy, sortOrder] = sortValue.split('_');
      const res: any = await exceptionService.getExceptions({
        page,
        limit: LIMIT,
        status: filterStatus === 'all' ? undefined : filterStatus,
        type: filterType === 'all' ? undefined : filterType,
        sessionId: searchTerm || undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
      });
      if (res.success) {
        const listData = Array.isArray(res.data) ? res.data : res.data?.data;
        setExceptions(listData || []);
        setTotalPages(res.pagination?.totalPages || res.data?.totalPages || 1);
        setTotalItems(res.pagination?.total || res.data?.total || listData.length);
      } else {
        setError(res.message || 'Lỗi khi tải danh sách ngoại lệ');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert size={24} />
            </div>
            Quản lý Ngoại lệ
          </h1>
          <p className="text-gray-500 mt-1.5 ml-14">
            Theo dõi, đánh giá và quản lý các sự cố phát sinh tại bãi xe
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ExceptionFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
          sortValue={sortValue}
          setSortValue={setSortValue}
        />
      </motion.div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="w-full">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-medium">Đang tải danh sách ngoại lệ...</p>
            </div>
          ) : error ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-rose-500">
              <AlertCircle size={40} className="mb-2 opacity-50" />
              <p className="font-medium text-sm">{error}</p>
              <button
                onClick={fetchExceptions}
                className="mt-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-sm font-bold"
              >
                Thử lại
              </button>
            </div>
          ) : exceptions.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-100">
                <SearchX className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-900">Không có dữ liệu</p>
              <p className="text-sm">Không tìm thấy ngoại lệ nào phù hợp</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-rose-50/50 text-rose-700 font-semibold border-b border-rose-100/50">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl w-[15%]">Mã lượt gửi</th>
                    <th className="px-6 py-4 w-[15%]">Xe</th>
                    <th className="px-6 py-4 w-[15%]">Loại ngoại lệ</th>
                    <th className="px-6 py-4 w-[15%]">Người tạo</th>
                    <th className="px-6 py-4 w-[15%]">Ngày tạo</th>
                    <th className="px-6 py-4 w-[15%]">Trạng thái</th>
                    <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exceptions.map((ex) => {
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
                      <tr key={ex._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-800">{sessionCode}</td>
                        <td className="px-6 py-4 text-gray-700">{licensePlate || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                            {EXCEPTION_TYPE_LABELS[ex.type]}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{staffName}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(ex.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ex.status)}`}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-rose-100/50 flex items-center justify-between bg-rose-50/50 rounded-b-2xl">
                  <p className="text-sm text-gray-500">
                    Hiển thị{' '}
                    <span className="font-medium text-gray-900">{(page - 1) * LIMIT + 1}</span> đến{' '}
                    <span className="font-medium text-gray-900">
                      {Math.min(page * LIMIT, totalItems)}
                    </span>{' '}
                    trong tổng số <span className="font-medium text-gray-900">{totalItems}</span>{' '}
                    kết quả
                  </p>
                  <div className="flex gap-1.5">
                    {totalPages >= 5 && (
                      <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                        title="Trang đầu"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                      title="Trang trước"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {(() => {
                      let pages: (number | string)[] = [];
                      if (totalPages <= 4) {
                        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                      } else if (page <= 3) {
                        pages = [1, 2, 3, '...', totalPages];
                      } else if (page >= totalPages - 2) {
                        pages = [1, '...', totalPages - 2, totalPages - 1, totalPages];
                      } else {
                        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                      }

                      return pages.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => typeof p === 'number' && setPage(p)}
                          disabled={p === '...'}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            p === '...'
                              ? 'text-gray-400 bg-transparent cursor-default'
                              : page === p
                                ? 'bg-rose-500 text-white border border-rose-600 font-bold shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                      title="Trang sau"
                    >
                      <ChevronRight size={16} />
                    </button>
                    {totalPages >= 5 && (
                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                        title="Trang cuối"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ExceptionReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exception={selectedException}
        onSubmitReview={handleReviewSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
