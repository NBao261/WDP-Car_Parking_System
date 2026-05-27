import { Search, ArrowRightCircle, Loader2 } from "lucide-react";
import { ExceptionStatus } from "../../../../services/exception.service";

export interface ExceptionData {
  id: string;
  code: string;
  plate: string;
  type: string;
  typeEnum: string;
  time: string;
  status: "NEW" | "PROCESSING" | "RESOLVED" | "REJECTED";
  staffName: string;
  managerName: string | null;
  managerNote: string | null;
  surcharge: number;
  // Session detail fields
  vehicleType: string;
  checkInTime: string;
  slotCode: string;
  floorName: string;
  gateIn: string;
  sessionId: string;
  updatedAt: string;
}

interface ExceptionsListProps {
  exceptionsList: ExceptionData[];
  isLoading: boolean;
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (q: string) => void;
  onFilterChange: (status: string) => void;
  onSelectException: (exc: ExceptionData) => void;
  onContinueCheckout: (plate: string) => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  RESOLVED:   { bg: "bg-[#e8f7f0]",  text: "text-[#1d7a4a]", label: "Đã giải quyết ✓" },
  NEW:        { bg: "bg-[#fff3e0]",  text: "text-[#c77700]", label: "Mới" },
  PROCESSING: { bg: "bg-[#e3ecf8]",  text: "text-[#1a5fa8]", label: "Đang xử lý" },
  REJECTED:   { bg: "bg-[#fde8e8]",  text: "text-[#b03030]", label: "Từ chối" },
};

export default function ExceptionsList({
  exceptionsList,
  isLoading,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onSelectException,
  onContinueCheckout,
}: ExceptionsListProps) {
  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm biển số, mã vé, loại ngoại lệ…"
            className="w-full h-10 pl-9 pr-4 border border-[#e8e9e8] rounded-[8px] text-sm focus:outline-none focus:border-[#060606]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="h-10 px-4 border border-[#e8e9e8] rounded-[8px] text-[13px] font-bold text-[#060606] outline-none focus:border-[#060606] cursor-pointer bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={ExceptionStatus.NEW.toUpperCase()}>Mới</option>
            <option value={ExceptionStatus.PROCESSING.toUpperCase()}>Đang xử lý</option>
            <option value={ExceptionStatus.RESOLVED.toUpperCase()}>Đã giải quyết</option>
            <option value={ExceptionStatus.REJECTED.toUpperCase()}>Từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e9e8] rounded-[14px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f5f5f5] text-[#6b6b6b] text-[11px] uppercase font-semibold border-b border-[#e8e9e8]">
            <tr>
              <th className="px-6 py-3">Mã Báo Cáo</th>
              <th className="px-6 py-3">Biển Số</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Báo Cáo Lúc</th>
              <th className="px-6 py-3">Trạng Thái</th>
              <th className="px-6 py-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e9e8]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#6b6b6b]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : exceptionsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#6b6b6b] text-sm">
                  {searchQuery
                    ? `Không tìm thấy kết quả cho "${searchQuery}"`
                    : "Bạn chưa có báo cáo ngoại lệ nào."}
                </td>
              </tr>
            ) : (
              exceptionsList.map((exc) => {
                const badge = STATUS_BADGE[exc.status] || STATUS_BADGE.NEW;
                return (
                  <tr key={exc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-[#6b6b6b] font-mono text-[12px]">
                      {exc.code}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[15px]">
                      {exc.plate}
                    </td>
                    <td className="px-6 py-4 text-[13px]">{exc.type}</td>
                    <td className="px-6 py-4 text-[13px]">{exc.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button
                        onClick={() => onSelectException(exc)}
                        className="px-4 py-1.5 bg-white border border-[#d7ee46] text-[#060606] font-medium rounded-lg hover:bg-gray-50 transition-all text-[13px] shadow-sm whitespace-nowrap"
                      >
                        Chi tiết
                      </button>
                      {exc.status === "RESOLVED" && (
                        <button
                          onClick={() => onContinueCheckout(exc.plate)}
                          className="bg-[#d7ee46] text-[#060606] px-3 py-1.5 flex items-center gap-1.5 rounded-[6px] text-[13px] font-semibold hover:brightness-95 transition-all whitespace-nowrap shadow-sm"
                        >
                          Check-out <ArrowRightCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
