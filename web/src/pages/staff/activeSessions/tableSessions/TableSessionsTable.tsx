import { AlertCircle } from 'lucide-react';
import { SortButton, FilterDropdown } from './TableSessionsFilters';
import { calculateDuration, getActiveBadgeClasses } from './TableSessionsUtils';
import { X } from 'lucide-react';

export function TableSessionsTable({ 
  currentData, loading, sortConfig, handleSort, 
  facilityVehicleTypes, filterVehicleTypeId, setFilterVehicleTypeId,
  uniqueLocations, filterLocation, setFilterLocation,
  uniqueGates, filterGate, setFilterGate,
  STATUS_OPTIONS, filterStatus, setFilterStatus,
  hasActiveFilters, handleResetFilters, setSelectedSession,
  currentPage, itemsPerPage
}: any) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full min-w-[1040px] table-fixed text-left text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-white">
            <th className="px-4 pt-4 pb-1"></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="MÃ THẺ" sortKey="cardCode" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="BIỂN SỐ" sortKey="licensePlate" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><FilterDropdown label="LOẠI XE" options={facilityVehicleTypes.map((vt:any) => ({ value: vt._id, label: vt.name }))} value={filterVehicleTypeId} onChange={setFilterVehicleTypeId} /></th>
            <th className="px-2 pt-4 pb-1"><FilterDropdown label="VỊ TRÍ" options={uniqueLocations.map((l:any) => ({ value: l, label: l }))} value={filterLocation} onChange={setFilterLocation} /></th>
            <th className="px-2 pt-4 pb-1"><FilterDropdown label="CỔNG VÀO" options={uniqueGates.map((g:any) => ({ value: g, label: g }))} value={filterGate} onChange={setFilterGate} /></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="NGÀY-GIỜ" sortKey="checkInTime" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><SortButton label="THỜI GIAN ĐỖ" sortKey="duration" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 pt-4 pb-1"><FilterDropdown label="TRẠNG THÁI" options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} /></th>
            <th className="px-2 pt-4 pb-1">
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="flex items-center justify-center w-full px-2 py-1.5 rounded-full text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3.5 h-3.5 mr-1" />Xóa bộ lọc
                </button>
              )}
            </th>
          </tr>
          <tr className="bg-[#f5f5f5] text-[#6b6b6b] text-[11px] uppercase font-semibold border-b border-[#e8e9e8]">
            <th className="px-4 py-3 font-semibold w-[50px] text-center">#</th>
            <th className="px-4 py-3 font-semibold w-[120px]">Mã thẻ</th>
            <th className="px-4 py-3 font-semibold w-[150px]">Biển số</th>
            <th className="px-4 py-3 font-semibold w-[120px]">Loại xe</th>
            <th className="px-4 py-3 font-semibold w-[150px]">Vị trí</th>
            <th className="px-4 py-3 font-semibold w-[120px]">Cổng vào</th>
            <th className="px-4 py-3 font-semibold w-[180px]">Giờ vào</th>
            <th className="px-4 py-3 font-semibold w-[120px]">Thời gian đỗ</th>
            <th className="px-4 py-3 font-semibold w-[120px]">Trạng thái</th>
            <th className="px-4 py-3 font-semibold w-[100px] text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {currentData.map((session:any, index:number) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={session._id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="px-4 py-4 text-[#6b6b6b] text-[13px] text-center font-medium truncate">{globalIndex}</td>
                <td className="px-4 py-4 text-[#060606] font-medium text-sm truncate">{session.cardCode || session.code}</td>
                <td className="px-4 py-4 font-mono font-bold text-[14px] text-[#060606] truncate">{session.licensePlate}</td>
                <td className="px-4 py-4 text-[#060606] text-[13px] truncate">{session.vehicleTypeId?.name || 'N/A'}</td>
                <td className="px-4 py-4 text-[#060606] text-[13px] truncate">{session.floorId && session.slotId ? `${session.floorId.name} - ${session.slotId.code}` : '—'}</td>
                <td className="px-4 py-4 text-[#060606] text-[13px] truncate">{session.gateIn || 'N/A'}</td>
                <td className="px-4 py-4 text-[#6b6b6b] text-[12px] tabular-nums truncate">{new Date(session.checkInTime).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-4 text-[#060606] text-[13px] font-medium tabular-nums truncate">{calculateDuration(session.checkInTime)}</td>
                <td className="px-4 py-4 truncate">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border ${session.status === 'exception' ? 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]/60' : getActiveBadgeClasses(session.checkInTime)}`}>
                    {session.status === 'active' ? 'Hoạt động' : session.status === 'exception' ? 'Sự cố' : session.status === 'completed' ? 'Đã hoàn thành' : session.status === 'pending_payment' ? 'Chờ thanh toán' : session.status}
                  </span>
                </td>
                <td className="px-4 py-4 flex items-center justify-center">
                  <button onClick={() => setSelectedSession(session)} className="px-3 py-1 bg-white border border-gray-200 text-[#060606] font-medium rounded-lg hover:bg-[#f5ffe8] hover:border-[#9FE870] transition-all text-xs shadow-sm">
                    Chi tiết
                  </button>
                </td>
              </tr>
            );
          })}
          {currentData.length === 0 && !loading && (<tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">Không có phiên đỗ xe nào đang hoạt động</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
