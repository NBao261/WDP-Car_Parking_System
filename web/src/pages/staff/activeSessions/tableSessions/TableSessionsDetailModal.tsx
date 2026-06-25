import { X } from 'lucide-react';
import { calculateDuration, getActiveBadgeClasses } from './TableSessionsUtils';

export function TableSessionsDetailModal({ selectedSession, setSelectedSession }: any) {
  if (!selectedSession) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Chi tiết của {selectedSession.code}</p>
            <h3 className="font-bold text-xl text-[#060606] font-mono">{selectedSession.licensePlate}</h3>
          </div>
          <button onClick={() => setSelectedSession(null)} className="p-1.5 hover:bg-gray-200 rounded-lg mt-0.5"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="w-full bg-[#060606] rounded-2xl flex items-center justify-center py-6">
            <span className="font-mono font-bold text-4xl tracking-widest text-[#d7ee46]">{selectedSession.licensePlate}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Mã thẻ</p><p className="font-semibold text-[#060606]">{selectedSession.cardCode || selectedSession.code}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Loại xe</p><p className="font-semibold text-[#060606]">{selectedSession.vehicleTypeId?.name || '—'}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Cổng vào</p><p className="font-semibold text-[#060606]">{selectedSession.gateIn || '—'}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Vị trí đỗ</p><p className="font-semibold text-[#060606]">{selectedSession.floorId && selectedSession.slotId ? `${selectedSession.floorId.name} - ${selectedSession.slotId.code}` : '—'}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Trạng thái</p><span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${selectedSession.status === 'exception' ? 'bg-orange-50 text-orange-700 border-orange-100' : getActiveBadgeClasses(selectedSession.checkInTime)}`}>{selectedSession.status}</span></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Giờ vào</p><p className="font-semibold text-[#060606]">{new Date(selectedSession.checkInTime).toLocaleString('vi-VN')}</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Giờ ra</p><p className="font-semibold text-[#060606]/40">Chưa ra</p></div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><p className="text-gray-400 text-xs mb-1">Thời gian đỗ</p><p className="font-semibold text-[#060606]">{calculateDuration(selectedSession.checkInTime)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
