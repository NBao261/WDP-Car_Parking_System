import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, AlertTriangle, CheckCircle2, Clock, XCircle, Scan } from 'lucide-react';
import { toast } from 'sonner';
import {
  exceptionService,
  IException,
  ExceptionStatus,
  ExceptionType,
  GetExceptionsParams,
  ReviewExceptionPayload,
} from '../../../services/exception.service';

import { StatCard } from '../../../components/ui/StatCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Pagination } from '../../../components/ui/Pagination';
import { ExceptionTable } from './components/ExceptionTable';
import { ReviewModal } from './components/ReviewModal';
import { FacilitySelector } from '../components/FacilitySelector';

const STATUS_TABS: { label: string; value: ExceptionStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: ExceptionStatus.NEW },
  { label: 'Đang xử lý', value: ExceptionStatus.PROCESSING },
  { label: 'Đã giải quyết', value: ExceptionStatus.RESOLVED },
  { label: 'Từ chối', value: ExceptionStatus.REJECTED },
];

export default function ManagerExceptionsPage() {
  // ── Filters ──
  const [facilityId, setFacilityId] = useState('');
  const [activeTab, setActiveTab] = useState<ExceptionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ExceptionType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 10;

  // ── Data ──
  const [exceptions, setExceptions] = useState<IException[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  // ── Review modal ──
  const [reviewTarget, setReviewTarget] = useState<IException | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Summary counts (cho stat cards) ──
  const [summary, setSummary] = useState({ new: 0, processing: 0, resolved: 0, rejected: 0 });

  // ── Load exceptions ──
  const loadExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetExceptionsParams = {
        page,
        limit: PAGE_LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (activeTab !== 'all') params.status = activeTab;
      if (typeFilter !== 'all') params.type = typeFilter;

      const res = await exceptionService.getExceptions(params);
      if (res.success) {
        setExceptions(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }

    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách ngoại lệ');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, typeFilter]);

  // ── Load summary counts (always all statuses) ──
  const loadSummary = useCallback(async () => {
    try {
      const [newRes, procRes, resRes, rejRes] = await Promise.all([
        exceptionService.getExceptions({ status: ExceptionStatus.NEW, limit: 1 }),
        exceptionService.getExceptions({ status: ExceptionStatus.PROCESSING, limit: 1 }),
        exceptionService.getExceptions({ status: ExceptionStatus.RESOLVED, limit: 1 }),
        exceptionService.getExceptions({ status: ExceptionStatus.REJECTED, limit: 1 }),
      ]);
      setSummary({
        new: newRes.data.total,
        processing: procRes.data.total,
        resolved: resRes.data.total,
        rejected: rejRes.data.total,
      });
    } catch { /* fail silently for summary */ }
  }, []);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Reset page khi đổi tab/filter
  useEffect(() => { setPage(1); }, [activeTab, typeFilter, facilityId]);

  // ── Client-side search filter (theo licensePlate/code) ──
  const filtered = search.trim()
    ? exceptions.filter((ex) => {
      const s = typeof ex.sessionId === 'object' ? ex.sessionId : null;
      return (
        s?.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
        s?.code?.toLowerCase().includes(search.toLowerCase()) ||
        ex.description?.toLowerCase().includes(search.toLowerCase())
      );
    })
    : exceptions;

  // ── Review submit ──
  const handleReview = async (id: string, payload: ReviewExceptionPayload) => {
    setSubmitting(true);
    try {
      const res = await exceptionService.reviewException(id, payload);
      if (res.success) {
        toast.success('Đã ghi nhận quyết định thành công');
        await Promise.all([loadExceptions(), loadSummary()]);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Review thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Detect overdue ──
  const handleDetectOverdue = async () => {
    toast.promise(
      exceptionService.detectOverdue().then((res) => {
        if (res.success) {
          loadExceptions();
          loadSummary();
          return res;
        }
        throw new Error('Quét thất bại');
      }),
      {
        loading: 'Đang quét xe quá hạn...',
        success: (res) => `Quét xong! Phát hiện ${res.data?.detected ?? 0} xe, tạo ${res.data?.created ?? 0} exception.`,
        error: 'Quét thất bại',
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Ngoại Lệ"
        description="Theo dõi và xử lý các trường hợp bất thường trong bãi xe"
        actions={
          <button
            onClick={handleDetectOverdue}
            className="flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] bg-transparent font-semibold text-[13px] px-4 h-[38px] rounded-lg hover:bg-[#f5f5f4] transition-colors"
          >
            <Scan size={15} /> Quét Quá Hạn
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Ngoại Lệ Mới" value={summary.new} icon={<AlertTriangle size={18} />} />
        <StatCard label="Đang Xử Lý" value={summary.processing} icon={<Clock size={18} />} />
        <StatCard label="Đã Giải Quyết" value={summary.resolved} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Từ Chối" value={summary.rejected} icon={<XCircle size={18} />} />
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3">
        {/* Status tabs */}
        <div className="flex gap-1 bg-[#f5f5f4] p-1 rounded-xl w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.value
                  ? 'bg-white text-[#060606] shadow-sm'
                  : 'text-[#6b6b6b] hover:text-[#060606]'
                }`}
            >
              {tab.label}
              {/* Badge đỏ chỉ hiện trên tab "Chờ xử lý" khi có exception mới */}
              {tab.value === ExceptionStatus.NEW && summary.new > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold bg-[#ef4444] text-white">
                  {summary.new > 99 ? '99+' : summary.new}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Type filter + Facility */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm biển số, mã lượt gửi, mô tả..."
              className="w-full pl-9 pr-4 h-[38px] bg-white border border-[#e8e9e8] rounded-lg text-[13px] outline-none focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="appearance-none pl-3 pr-8 h-[38px] border border-[#e8e9e8] rounded-lg bg-white text-[13px] text-[#060606] font-medium outline-none cursor-pointer focus:border-[#d7ee46]"
            >
              <option value="all">Tất cả loại</option>
              {Object.values(ExceptionType).map((t) => (
                <option key={t} value={t}>{t === ExceptionType.LOST_CARD ? 'Mất vé' : t === ExceptionType.WRONG_PLATE ? 'Sai biển' : t === ExceptionType.OVERTIME ? 'Quá giờ' : t === ExceptionType.WRONG_ZONE ? 'Sai khu' : t === ExceptionType.UNPAID ? 'Chưa TT' : 'Khác'}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" />
          </div>

          <FacilitySelector
            value={facilityId}
            onChange={(id) => setFacilityId(id)}
            className="w-48"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <ExceptionTable data={filtered} loading={loading} onReview={setReviewTarget} />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageLimit={PAGE_LIMIT}
          onPageChange={setPage}
          itemLabel="ngoại lệ"
        />
      )}

      {/* ── Review Modal ── */}
      <ReviewModal
        exception={reviewTarget}
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleReview}
        submitting={submitting}
      />
    </div>
  );
}
