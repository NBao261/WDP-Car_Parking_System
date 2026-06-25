import { Loader2, ShieldAlert, X } from "lucide-react";
import { SortButton, FilterDropdown } from "./ExceptionsFilters";

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

export function ExceptionsTable({
  isLoading, exceptionsList, currentData,
  sortConfig, handleSort,
  filterType, setFilterType, uniqueTypes,
  filterStatus, onFilterChange,
  hasActiveFilters, handleResetFilters,
  onSelectException, currentPage, itemsPerPage
}: any) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm text-left table-fixed whitespace-nowrap">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-white">
            <th className="px-4 pt-4 pb-1"></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="MÃ THẺ" sortKey="cardCode" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="BIỂN SỐ" sortKey="plate" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><FilterDropdown label="LOẠI SỰ CỐ" options={uniqueTypes.map((t:any) => ({ value: t, label: t }))} value={filterType} onChange={setFilterType} /></th>
            <th className="px-2 pt-4 pb-1"></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="GHI NHẬN LÚC" sortKey="time" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="PHỤ PHÍ" sortKey="surcharge" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1">
              <FilterDropdown label="TRẠNG THÁI" options={[
                { value: 'NEW', label: 'Chờ xử lý' },
                { value: 'RESOLVED', label: 'Đã xử lý' },
              ]} value={filterStatus === 'ALL' ? 'All' : filterStatus} onChange={(val) => onFilterChange(val === 'All' ? 'ALL' : val)} />
            </th>
            <th className="px-2 pt-4 pb-1">
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="flex items-center justify-center w-full px-2 py-1.5 rounded-full text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3.5 h-3.5 mr-1" />Xóa bộ lọc
                </button>
              )}
            </th>
          </tr>
          <tr className="bg-[#f5f5f5] text-[#6b6b6b] text-[11px] uppercase font-semibold border-b border-[#e8e9e8]">
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
            <tr><td colSpan={9} className="px-6 py-12 text-center"><div className="flex items-center justify-center gap-2 text-[#6b6b6b]"><Loader2 className="w-5 h-5 animate-spin" /><span>Đang tải dữ liệu...</span></div></td></tr>
          ) : exceptionsList.length === 0 ? (
            <tr><td colSpan={9} className="px-6 py-16 text-center"><div className="flex flex-col items-center justify-center text-[#6b6b6b]"><ShieldAlert className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} /><span className="text-sm font-medium">Danh sách báo cáo sự cố đang trống.</span></div></td></tr>
          ) : (
            currentData.map((exc:any, index:number) => {
              const statusBadge = STATUS_BADGE[exc.status] || STATUS_BADGE.NEW;
              const typeBadge = TYPE_BADGE[exc.typeEnum] || TYPE_BADGE.default;
              const stt = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr key={exc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-[13px] text-[#6b6b6b] text-center font-medium">{stt}</td>
                  <td className="px-4 py-4"><div className="font-mono text-[#060606] text-[12px] truncate">{exc.code}</div><div className="text-[11px] text-[#6b6b6b] truncate mt-0.5">{exc.cardCode}</div></td>
                  <td className="px-4 py-4 font-mono font-bold text-[14px] text-[#060606]">{exc.plate}</td>
                  <td className="px-4 py-4 text-[12px]"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border} whitespace-nowrap`}>{exc.type}</span></td>
                  <td className="px-4 py-4 text-[13px] text-[#4b4b4b]"><div className="truncate max-w-[180px]">{exc.description}</div></td>
                  <td className="px-4 py-4 text-[12px] text-[#6b6b6b]">{exc.time}</td>
                  <td className="px-4 py-4 text-[13px] font-medium text-[#060606]">{exc.surcharge > 0 ? `${exc.surcharge.toLocaleString("vi-VN")} VNĐ` : "—"}</td>
                  <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} whitespace-nowrap`}>{statusBadge.label}</span></td>
                  <td className="px-4 py-4 flex items-center justify-center">
                    <button onClick={(e) => { e.stopPropagation(); onSelectException(exc); }} className="px-3 py-1.5 bg-white border border-[#d7ee46] text-[#060606] font-medium rounded-lg hover:bg-[#d7ee46]/10 transition-all text-[12px] shadow-sm whitespace-nowrap">
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
  );
}
