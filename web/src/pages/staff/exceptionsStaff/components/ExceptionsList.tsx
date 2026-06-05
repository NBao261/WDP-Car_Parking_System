import { Search, ArrowRightCircle, Loader2, ShieldAlert } from "lucide-react";
import { ExceptionStatus } from "../../../../services/exception.service";

export interface ExceptionData {
  id: string;
  code: string;
  cardCode: string;
  plate: string;
  type: string;
  typeEnum: string;
  time: string;
  status: "NEW" | "PROCESSING" | "RESOLVED" | "REJECTED";
  staffName: string;
  resolvedByStaffName: string | null;
  staffNote: string;
  managerName: string | null;
  managerNote: string | null;
  surcharge: number;
  description: string;
  // Session detail fields
  vehicleType: string;
  checkInTime: string;
  slotCode: string;
  floorName: string;
  facilityName: string;
  facilityId: string;
  vehicleTypeIdStr: string;
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
  RESOLVED: { bg: "bg-[#e8f7f0]", text: "text-[#1d7a4a]", label: "Đã xử lý" },
  NEW: { bg: "bg-[#fff3e0]", text: "text-[#c77700]", label: "Chờ xử lý" },
  PROCESSING: { bg: "bg-[#e3ecf8]", text: "text-[#1a5fa8]", label: "Đang xử lý" },
  REJECTED: { bg: "bg-[#fde8e8]", text: "text-[#b03030]", label: "Từ chối" },
};

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  lost_card: { bg: "bg-[#fde8e8]", text: "text-[#b03030]" }, // Đỏ
  overtime: { bg: "bg-[#fff3e0]", text: "text-[#c77700]" }, // Cam
  default: { bg: "bg-[#f5f5f5]", text: "text-[#6b6b6b]" },
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
            <option value={ExceptionStatus.NEW.toUpperCase()}>Chờ xử lý</option>
            {/* <option value={ExceptionStatus.PROCESSING.toUpperCase()}>Đang xử lý</option> */}
            <option value={ExceptionStatus.RESOLVED.toUpperCase()}>Đã xử lý</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e9e8] rounded-[14px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#f5f5f5] text-[#6b6b6b] text-[11px] uppercase font-semibold border-b border-[#e8e9e8]">
            <tr>
              <th className="px-4 py-3 w-[15%]">Mã Lượt Gửi / Thẻ</th>
              <th className="px-4 py-3 w-[12%]">Biển Số</th>
              <th className="px-4 py-3 w-[12%]">Loại</th>
              <th className="px-4 py-3 w-[18%]">Mô Tả</th>
              <th className="px-4 py-3 w-[15%]">Ghi Nhận Lúc</th>
              <th className="px-4 py-3 w-[10%]">Phụ Phí</th>
              <th className="px-4 py-3 w-[10%]">Trạng Thái</th>
              <th className="px-4 py-3 w-[8%]">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e9e8]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#6b6b6b]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : exceptionsList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6b6b6b]">
                    <ShieldAlert className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Danh sách báo cáo ngoại lệ đang trống.</span>
                  </div>
                </td>
              </tr>
            ) : (
              exceptionsList.map((exc) => {
                const statusBadge = STATUS_BADGE[exc.status] || STATUS_BADGE.NEW;
                const typeBadge = TYPE_BADGE[exc.typeEnum] || TYPE_BADGE.default;

                return (
                  <tr key={exc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectException(exc)}>
                    <td className="px-4 py-4">
                      <div className="font-mono text-[#060606] text-[12px] truncate">{exc.code}</div>
                      <div className="text-[11px] text-[#6b6b6b] truncate mt-0.5">{exc.cardCode}</div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-[14px] text-[#060606]">
                      {exc.plate}
                    </td>
                    <td className="px-4 py-4 text-[12px]">
                      <span className={`px-2 py-1 rounded-[6px] font-medium ${typeBadge.bg} ${typeBadge.text} whitespace-nowrap`}>
                        {exc.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4b4b4b]">
                      <div className="truncate max-w-[180px]">{exc.description}</div>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#6b6b6b]">{exc.time}</td>
                    <td className="px-4 py-4 text-[13px] font-medium text-[#060606]">
                      {exc.surcharge > 0 ? `${exc.surcharge.toLocaleString("vi-VN")} VNĐ` : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text} whitespace-nowrap`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectException(exc); }}
                        className="px-3 py-1.5 bg-white border border-[#d7ee46] text-[#060606] font-medium rounded-lg hover:bg-[#d7ee46]/10 transition-all text-[12px] shadow-sm whitespace-nowrap"
                      >
                        Chi tiết
                      </button>
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
