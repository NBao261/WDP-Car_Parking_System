import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ExceptionsList, { ExceptionData } from './components/ExceptionsList';
import ExceptionDetailDrawer from './components/ExceptionDetailDrawer';
import CreateExceptionModal from './components/CreateExceptionModal';
import {
  exceptionService,
  ExceptionType,
  EXCEPTION_TYPE_LABELS,
} from '../../../services/exception.service';
import { pricingService } from '../../../services/pricing.service';

// ─── Map API Response → ExceptionData (UI) ───────────────────────────
function mapApiException(exc: any, pricingMap?: Map<string, number>): ExceptionData {
  const session = typeof exc.sessionId === 'object' ? exc.sessionId : null;
  const staff = typeof exc.staffId === 'object' ? exc.staffId : null;
  const manager = typeof exc.managerId === 'object' && exc.managerId ? exc.managerId : null;
  const resolvedBy =
    typeof exc.resolvedByStaffId === 'object' && exc.resolvedByStaffId
      ? exc.resolvedByStaffId
      : null;

  let finalSurcharge = exc.surcharge || 0;
  // Nếu là mất vé và surcharge = 0, thử lấy lostCardFee từ PricingPlan
  if (exc.type === ExceptionType.LOST_CARD && finalSurcharge === 0 && session?.pricingPlanId) {
    const fee = pricingMap?.get(session.pricingPlanId.toString());
    if (fee) finalSurcharge = fee;
  }

  return {
    id: exc._id,
    code: session?.code || exc._id,
    cardCode: session?.cardCode || '—',
    plate: session?.licensePlate || '—',
    type: EXCEPTION_TYPE_LABELS[exc.type as ExceptionType] || exc.type,
    typeEnum: exc.type,
    time: new Date(exc.createdAt).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: exc.status.toUpperCase() as ExceptionData['status'],
    staffName: staff?.name || '—',
    resolvedByStaffName: resolvedBy?.name || null,
    staffNote: exc.staffNote || '',
    managerName: manager?.name || null,
    managerNote: exc.managerNote || null,
    surcharge: finalSurcharge,
    description: exc.description || '',
    // Session details
    vehicleType: (session?.vehicleTypeId as any)?.name || '—',
    checkInTime: session?.checkInTime
      ? new Date(session.checkInTime).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    slotCode: (session?.slotId as any)?.code || '—',
    floorName: (session?.floorId as any)?.name || '—',
    facilityName: (session?.facilityId as any)?.name || '—',
    facilityId: (session?.facilityId as any)?._id || '',
    vehicleTypeIdStr: (session?.vehicleTypeId as any)?._id || '',
    gateIn: session?.gateIn || '—',
    sessionId: session?._id || (typeof exc.sessionId === 'string' ? exc.sessionId : ''),
    updatedAt: new Date(exc.updatedAt).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export default function ExceptionsStaffPage() {
  const [selectedException, setSelectedException] = useState<ExceptionData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [exceptionsList, setExceptionsList] = useState<ExceptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  const fetchExceptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { sortBy: 'createdAt', sortOrder: 'desc', limit: 50 };
      if (filterStatus !== 'ALL') params.status = filterStatus.toLowerCase();

      // Sử dụng API thực tế thay vì mock data để có thể thấy ngoại lệ mới tạo
      const [res, pricingRes]: [any, any] = await Promise.all([
        exceptionService.getExceptions(params),
        pricingService.getAll({ limit: 100 }),
      ]);

      const pricingMap = new Map<string, number>();
      if (pricingRes.success && pricingRes.data) {
        // Backend pagination data might be in res.data or res.data.data
        const plans = Array.isArray(pricingRes.data) ? pricingRes.data : pricingRes.data.data;
        if (Array.isArray(plans)) {
          plans.forEach((p: any) => {
            if (p._id && p.lostCardFee !== undefined) {
              pricingMap.set(p._id.toString(), p.lostCardFee);
            }
          });
        }
      }

      // Backend returns { success: true, data: [...], pagination: {...} }
      // The array is in res.data directly, not res.data.data
      const listData = Array.isArray(res.data) ? res.data : res.data?.data;

      if (res.success && listData) {
        setExceptionsList(listData.map((exc: any) => mapApiException(exc, pricingMap)));
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách ngoại lệ!');
      setExceptionsList([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  // Search filter (client-side)
  const filteredList = exceptionsList.filter((exc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      exc.plate.toLowerCase().includes(q) ||
      exc.code.toLowerCase().includes(q) ||
      exc.cardCode.toLowerCase().includes(q) ||
      exc.type.toLowerCase().includes(q)
    );
  });

  const handleContinueCheckout = (plate: string) => {
    navigate('/staff', { state: { plate } });
  };

  return (
    <div className="h-full max-w-[1400px] mx-auto pb-10 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#060606]">Xử lí ngoại lệ</h2>
          <p className="text-sm text-[#6b6b6b] mt-1">
            Các ngoại lệ bạn đã báo cáo và trạng thái giải quyết.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-[13px] font-bold bg-[#1a1a1a] text-[#9FE870] rounded-[8px] hover:bg-black transition-colors"
          >
            + Tạo Ngoại Lệ
          </button>
          <button
            onClick={fetchExceptions}
            disabled={isLoading}
            className="px-4 py-2 text-[13px] font-medium border border-[#e8e9e8] rounded-[8px] hover:bg-[#f5ffe8] hover:border-[#9FE870] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang tải...' : '↻ Làm mới'}
          </button>
        </div>
      </div>

      <ExceptionsList
        exceptionsList={filteredList}
        isLoading={isLoading}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        onSelectException={setSelectedException}
        onContinueCheckout={handleContinueCheckout}
      />

      <ExceptionDetailDrawer
        selectedException={selectedException}
        onClose={() => setSelectedException(null)}
        onContinueCheckout={handleContinueCheckout}
        onResolved={fetchExceptions}
      />

      <CreateExceptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchExceptions}
      />
    </div>
  );
}
