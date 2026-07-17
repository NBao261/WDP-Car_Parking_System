import { X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { calculateDuration, getActiveBadgeClasses } from './TableSessionsUtils';

export function TableSessionsDetailModal({ selectedSession, setSelectedSession, setToastMessage }: any) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (selectedSession) {
      setImageError(false);
    }
  }, [selectedSession]);

  if (!selectedSession) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'exception': return 'Sự cố';
      case 'completed': return 'Đã hoàn thành';
      case 'pending_payment': return 'Chờ thanh toán';
      default: return status;
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <h3 className="font-bold text-lg text-[#060606] uppercase tracking-wide">Chi tiết phiên đỗ xe</h3>
          <button onClick={() => setSelectedSession(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8 overflow-y-auto max-h-[85vh] bg-gray-50/50">
          {/* Cột trái: Ảnh xe + Biển số */}
          <div className="w-full md:w-5/12 flex flex-col gap-4">
            <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center shadow-sm">
              {selectedSession.checkInImage && !imageError ? (
                <img
                  src={getFullImageUrl(selectedSession.checkInImage)}
                  alt="Vehicle Check-In"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImageError(true);
                    if (setToastMessage) {
                      setToastMessage("Không thể tải ảnh chụp phương tiện. Vui lòng thử lại sau.");
                      setTimeout(() => setToastMessage(''), 3500);
                    }
                  }}
                />
              ) : selectedSession.checkInImage && imageError ? (
                <div className="flex items-center justify-center w-full h-full p-4">
                  <div className="border border-solid border-red-300 w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-xl bg-red-50 shadow-sm">
                    <ImageIcon className="w-8 h-8 mb-2 text-red-300" />
                    <span className="text-[12px] text-red-600 font-medium leading-relaxed px-2">
                      Lỗi hiển thị:<br />Không thể tải ảnh phương tiện
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full p-4">
                  <div className="border border-solid border-gray-300 w-full h-full flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white shadow-sm">
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-300" />
                    <span className="text-[12px] text-gray-500 font-medium leading-relaxed px-2">
                      Không có ảnh hoặc phương tiện<br />không yêu cầu ảnh xe vào
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full bg-[#060606] rounded-2xl flex items-center justify-center py-5 shadow-inner">
              <span className="font-mono font-bold text-4xl tracking-widest text-[#d7ee46]">{selectedSession.licensePlate}</span>
            </div>
          </div>

          {/* Cột phải: Chi tiết thông tin (Dạng list) */}
          <div className="w-full md:w-7/12 flex flex-col bg-white border border-[#9FE870] rounded-2xl shadow-sm overflow-hidden">

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Trạng thái</span>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${selectedSession.status === 'exception' ? 'bg-orange-50 text-orange-700 border-orange-100' : getActiveBadgeClasses(selectedSession.checkInTime)}`}>
                {getStatusText(selectedSession.status)}
              </span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Mã thẻ</span>
              <span className="font-semibold text-[#060606] text-[14px]">{selectedSession.cardCode || selectedSession.code || '—'}</span>
            </div>

            {selectedSession.driverId?.name && (
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
                <span className="text-gray-500 text-[13px] font-medium">Chủ xe (Đặt trước)</span>
                <span className="font-semibold text-[#060606] text-[14px]">{selectedSession.driverId.name}</span>
              </div>
            )}

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Loại xe</span>
              <span className="font-semibold text-[#060606] text-[14px]">{selectedSession.vehicleTypeId?.name || '—'}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Cổng vào</span>
              <span className="font-semibold text-[#060606] text-[14px]">{selectedSession.gateIn || '—'}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Vị trí đỗ</span>
              <span className="font-semibold text-[#060606] text-[14px]">{selectedSession.floorId && selectedSession.slotId ? `${selectedSession.floorId.name} - ${selectedSession.slotId.code}` : '—'}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <span className="text-gray-500 text-[13px] font-medium">Giờ vào</span>
              <span className="font-semibold text-[#060606] text-[14px]">{new Date(selectedSession.checkInTime).toLocaleString('vi-VN')}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5 bg-gray-50">
              <span className="text-gray-500 text-[13px] font-medium">Thời gian đã đỗ</span>
              <span className="font-bold text-[#060606] text-[14px]">{calculateDuration(selectedSession.checkInTime)}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
