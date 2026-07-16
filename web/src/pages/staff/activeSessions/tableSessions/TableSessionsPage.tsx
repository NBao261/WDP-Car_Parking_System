import { Search, Filter, AlertCircle } from 'lucide-react';
import { useTableSessionsLogic } from './useTableSessionsLogic';
import { TableSessionsTable } from './TableSessionsTable';
import { TableSessionsPagination } from './TableSessionsPagination';
import { TableSessionsDetailModal } from './TableSessionsDetailModal';

export default function TableSessionsPage({ onTotalChange }: { onTotalChange?: (total: number) => void }) {
  const logic = useTableSessionsLogic(onTotalChange);

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'exception', label: 'Sự cố' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'pending_payment', label: 'Chờ thanh toán' }
  ];

  const uniqueGates = Array.from(new Set(logic.sessions.map(s => s.gateIn).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(logic.sessions.map(s => s.floorId && s.slotId ? `${s.floorId.name} - ${s.slotId.code}` : '').filter(Boolean)));
  const totalPages = Math.ceil(logic.filteredSessions.length / logic.itemsPerPage) || 1;
  const currentData = logic.filteredSessions.slice((logic.currentPage - 1) * logic.itemsPerPage, logic.currentPage * logic.itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden relative">
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap bg-[#f5f5f5]">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm biển số hoặc mã thẻ..." value={logic.search} onChange={logic.handleSearchChange}
            maxLength={12}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#9FE870] focus:ring-1 focus:ring-[#9FE870]/40 transition-colors"
          />
        </div>
      </div>

      <TableSessionsTable
        currentData={currentData} loading={logic.loading} sortConfig={logic.sortConfig} handleSort={logic.handleSort}
        facilityVehicleTypes={logic.facilityVehicleTypes} filterVehicleTypeId={logic.filterVehicleTypeId} setFilterVehicleTypeId={logic.setFilterVehicleTypeId}
        uniqueLocations={uniqueLocations} filterLocation={logic.filterLocation} setFilterLocation={logic.setFilterLocation}
        uniqueGates={uniqueGates} filterGate={logic.filterGate} setFilterGate={logic.setFilterGate}
        STATUS_OPTIONS={STATUS_OPTIONS} filterStatus={logic.filterStatus} setFilterStatus={logic.setFilterStatus}
        hasActiveFilters={logic.hasActiveFilters} handleResetFilters={logic.handleResetFilters} setSelectedSession={logic.setSelectedSession}
        currentPage={logic.currentPage} itemsPerPage={logic.itemsPerPage}
      />

      <TableSessionsPagination currentPage={logic.currentPage} setCurrentPage={logic.setCurrentPage} totalPages={totalPages} filteredSessions={logic.filteredSessions} itemsPerPage={logic.itemsPerPage} />

      {logic.toastMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-6 py-3 rounded-lg shadow-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{logic.toastMessage}</span>
        </div>
      )}

      <TableSessionsDetailModal selectedSession={logic.selectedSession} setSelectedSession={logic.setSelectedSession} setToastMessage={logic.setToastMessage} />

      {logic.showCheckoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#060606] text-white">
              <h3 className="font-semibold text-lg flex items-center gap-2">Xác nhận Checkout</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-5">Thanh toán và mở barie cho xe <strong className="font-mono text-lg text-[#060606] ml-1">{logic.showCheckoutModal.licensePlate}</strong></p>
              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-medium text-gray-500">Số tiền thu:</span>
                <span className="text-2xl font-bold text-[#060606]">{logic.showCheckoutModal.totalFee?.toLocaleString('vi-VN') || 0} ₫</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => logic.setShowCheckoutModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 text-[#060606]">Hủy bỏ</button>
                <button onClick={() => { alert('Đã thu tiền & Mở barie thành công!'); logic.setShowCheckoutModal(null); logic.fetchSessions(); }} className="flex-1 py-3 bg-[#d7ee46] rounded-xl font-semibold hover:brightness-95 text-[#060606]">Thu tiền & Mở Cổng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
