import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ExceptionsList, { ExceptionData } from "./components/ExceptionsList";
import ExceptionDetailDrawer from "./components/ExceptionDetailDrawer";
import {
  exceptionService,
  EXCEPTION_TYPE_LABELS,
  IException,
} from "../../../services/exception.service";

// ─── Map IException (từ API) → ExceptionData (UI) ───────────────────────────
function mapApiException(exc: IException): ExceptionData {
  const session = typeof exc.sessionId === "object" ? exc.sessionId : null;
  const staff = typeof exc.staffId === "object" ? exc.staffId : null;
  const manager = typeof exc.managerId === "object" && exc.managerId ? exc.managerId : null;

  return {
    id: exc._id,
    code: session?.code || exc._id,
    plate: session?.licensePlate || "—",
    type: EXCEPTION_TYPE_LABELS[exc.type] || exc.type,
    typeEnum: exc.type,
    time: new Date(exc.createdAt).toLocaleString("vi-VN"),
    status: exc.status.toUpperCase() as ExceptionData["status"],
    staffName: staff?.name || "—",
    managerName: manager?.name || null,
    managerNote: exc.managerNote || null,
    surcharge: exc.surcharge,
    // Session details
    vehicleType: (session?.vehicleTypeId as any)?.name || "—",
    checkInTime: session?.checkInTime
      ? new Date(session.checkInTime).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
    slotCode: (session?.slotId as any)?.code || "—",
    floorName: (session?.floorId as any)?.name || "—",
    gateIn: session?.gateIn || "—",
    sessionId: session?._id || (typeof exc.sessionId === "string" ? exc.sessionId : ""),
    updatedAt: new Date(exc.updatedAt).toLocaleString("vi-VN"),
  };
}

export default function ExceptionsStaffPage() {
  const [selectedException, setSelectedException] = useState<ExceptionData | null>(null);
  const [exceptionsList, setExceptionsList] = useState<ExceptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const fetchExceptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { sortBy: "createdAt", sortOrder: "desc", limit: 50 };
      if (filterStatus !== "ALL") params.status = filterStatus.toLowerCase();

      const res = await exceptionService.getExceptions(params);
      if (res.success && res.data?.data) {
        setExceptionsList(res.data.data.map(mapApiException));
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách ngoại lệ!");
      setExceptionsList([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  // Search filter (client-side — trên dữ liệu đã fetch)
  const filteredList = exceptionsList.filter((exc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      exc.plate.toLowerCase().includes(q) ||
      exc.code.toLowerCase().includes(q) ||
      exc.type.toLowerCase().includes(q)
    );
  });

  const handleContinueCheckout = (plate: string) => {
    navigate("/staff", { state: { plate } });
  };

  return (
    <div className="h-full max-w-6xl mx-auto pb-10 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-[#060606]">Ngoại lệ của tôi</h2>
          <p className="text-sm text-[#6b6b6b] mt-1">
            Các ngoại lệ bạn đã báo cáo và trạng thái giải quyết.
          </p>
        </div>
        <button
          onClick={fetchExceptions}
          disabled={isLoading}
          className="px-4 py-2 text-[13px] font-medium border border-[#e8e9e8] rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Đang tải..." : "↻ Làm mới"}
        </button>
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
      />
    </div>
  );
}