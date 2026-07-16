import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { SortButton, FilterDropdown, SearchHeaderInput } from './TableSessionsFilters';
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] table-fixed text-left text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="bg-[#f5f5f5] border-b border-[#e8e9e8] text-left">
            <th className="px-4 py-3 text-[#6b6b6b] text-[11px] uppercase font-semibold w-[50px] text-center align-middle">#</th>
            <th className="px-2 py-2 w-[120px]"><SortButton label="Mã thẻ" sortKey="cardCode" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 py-2 w-[150px]"><SortButton label="Biển số" sortKey="licensePlate" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 py-2 w-[120px]"><FilterDropdown label="Loại xe" options={facilityVehicleTypes.map((vt:any) => ({ value: vt._id, label: vt.name }))} value={filterVehicleTypeId} onChange={setFilterVehicleTypeId} /></th>
            <th className="px-2 py-2 w-[150px]"><SearchHeaderInput label="Vị trí" value={filterLocation} onChange={(val) => setFilterLocation(val || 'All')} /></th>
            <th className="px-2 py-2 w-[120px]"><FilterDropdown label="Cổng vào" options={uniqueGates.map((g:any) => ({ value: g, label: g }))} value={filterGate} onChange={setFilterGate} /></th>
            <th className="px-2 py-2 w-[180px]"><SortButton label="Giờ vào" sortKey="checkInTime" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 py-2 w-[120px]"><SortButton label="Thời gian đỗ" sortKey="duration" currentSort={sortConfig} onSort={handleSort} /></th>
            <th className="px-2 py-2 w-[120px]"><FilterDropdown label="Trạng thái" options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} /></th>
            <th className="px-4 py-2 w-[100px] text-[#6b6b6b] text-[11px] uppercase font-semibold text-center align-middle">
              {hasActiveFilters ? (
                <button onClick={handleResetFilters} className="flex items-center justify-center w-full px-2 py-1.5 rounded-md text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3.5 h-3.5 mr-1" />Xóa bộ lọc
                </button>
              ) : (
                "Thao tác"
              )}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 relative">
          {currentData.map((session:any, index:number) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <motion.tr 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={session._id}
                className="hover:bg-[#9FE870]/10 transition-colors group"
              >
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
              </motion.tr>
            );
          })}
          {currentData.length === 0 && !loading && (<tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">Không có phiên đỗ xe nào đang hoạt động</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
