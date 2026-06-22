import { Search, Loader2, ShieldAlert } from "lucide-react";
import { ExceptionStatus } from "../../../../services/exception.service";
import { useState, useEffect } from "react";

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

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RESOLVED:   { bg: "bg-[#9FE870]/10",   text: "text-[#2d6a1f]",  border: "border-[#9FE870]/50",  label: "Đã xử lý" },
  NEW:        { bg: "bg-[#fef3c7]",     text: "text-[#92400e]",  border: "border-[#fcd34d]/60",  label: "Chờ xử lý" },
  PROCESSING: { bg: "bg-[#dbeafe]",     text: "text-[#1e40af]",  border: "border-[#93c5fd]/60",  label: "Đang xử lý" },
  REJECTED:   { bg: "bg-[#fee2e2]",     text: "text-[#991b1b]",  border: "border-[#fca5a5]/60",  label: "Từ chối" },
};

const TYPE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  lost_card: { bg: "bg-[#fee2e2]", text: "text-[#991b1b]", border: "border-[#fca5a5]/60" },
  overtime:  { bg: "bg-[#fef3c7]", text: "text-[#92400e]", border: "border-[#fcd34d]/60" },
  default:   { bg: "bg-[#f5f5f5]", text: "text-[#6b6b6b]", border: "border-[#e5e5e5]" },
};

export default function ExceptionsList({
  exceptionsList,
  isLoading,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onSelectException,
  onContinueCheckout: _onContinueCheckout,
}: ExceptionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(exceptionsList.length / itemsPerPage) || 1;
  const currentData = exceptionsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden relative">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm biển số, mã vé, loại ngoại lệ…"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#9FE870] focus:ring-1 focus:ring-[#9FE870]/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-[#060606] bg-white focus:outline-none focus:border-[#9FE870] transition-colors"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={ExceptionStatus.NEW.toUpperCase()}>Chờ xử lý</option>
            <option value={ExceptionStatus.RESOLVED.toUpperCase()}>Đã xử lý</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 bg-white">
        <table className="w-full min-w-[1040px] table-fixed text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-[11px] text-[#060606]/50 border-b border-gray-100 font-semibold uppercase tracking-wider">
              <th className="px-4 py-3 w-[5%] text-center">STT</th>
              <th className="px-4 py-3 w-[13%]">Mã Lượt Gửi / Thẻ</th>
              <th className="px-4 py-3 w-[12%]">Biển Số</th>
              <th className="px-4 py-3 w-[12%]">Loại</th>
              <th className="px-4 py-3 w-[10%]">Mô Tả</th>
              <th className="px-4 py-3 w-[14%]">Ghi Nhận Lúc</th>
              <th className="px-4 py-3 w-[8%]">Phụ Phí</th>
              <th className="px-4 py-3 w-[8%]">Trạng Thái</th>
              <th className="px-4 py-3 w-[12%] text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e9e8]">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#6b6b6b]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : exceptionsList.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6b6b6b]">
                    <ShieldAlert className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Danh sách báo cáo ngoại lệ đang trống.</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((exc, index) => {
                const statusBadge = STATUS_BADGE[exc.status] || STATUS_BADGE.NEW;
                const typeBadge = TYPE_BADGE[exc.typeEnum] || TYPE_BADGE.default;
                const stt = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr key={exc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-[13px] text-[#6b6b6b] text-center font-medium">{stt}</td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-[#060606] text-[12px] truncate">{exc.code}</div>
                      <div className="text-[11px] text-[#6b6b6b] truncate mt-0.5">{exc.cardCode}</div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-[14px] text-[#060606]">
                      {exc.plate}
                    </td>
                    <td className="px-4 py-4 text-[12px]">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border} whitespace-nowrap`}>
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
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} whitespace-nowrap`}
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

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <div className="text-sm text-gray-500">
          Hiển thị {(currentPage - 1) * itemsPerPage + (exceptionsList.length > 0 ? 1 : 0)} đến {Math.min(currentPage * itemsPerPage, exceptionsList.length)} trên tổng số {exceptionsList.length} mục
        </div>
        {exceptionsList.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <div className="flex gap-1 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-[#1a1a1a] text-[#9FE870]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
