import { X } from "lucide-react";
import { ExceptionData } from "./ExceptionsList";

interface ExceptionDetailDrawerProps {
  selectedException: ExceptionData | null;
  onClose: () => void;
  onContinueCheckout: (plate: string) => void;
}

export default function ExceptionDetailDrawer({ selectedException, onClose, onContinueCheckout }: ExceptionDetailDrawerProps) {
  if (!selectedException) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-[420px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        <div className="px-6 py-7 border-b border-[#e8e9e8] flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-bold text-[#060606]">Chi tiết Ngoại lệ</h3>
            <p className="text-[12px] text-[#6b6b6b] mt-1">Mã Báo Cáo · {selectedException.id}</p>
          </div>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {/* VEHICLE INFO */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">Thông tin Xe</h4>
            <div className="space-y-3">
              <div>
                <div className="text-[12px] text-[#6b6b6b]">Biển số</div>
                <div className="font-mono text-[24px] font-bold text-[#060606]">{selectedException.plate}</div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Loại & Màu:</span>
                <span className="font-medium">Ô tô • Trắng</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Phiên/Khu vực:</span>
                <span className="font-medium">S-1030 · Slot B2-45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Giờ vào:</span>
                <span className="font-medium">08:15 AM · Cổng 2 · Topaz 2</span>
              </div>
            </div>
          </div>

          {/* REPORT INFO */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">Thông tin Báo cáo</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Loại ngoại lệ:</span>
                <span className="font-medium">{selectedException.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Báo cáo lúc:</span>
                <span className="font-medium">{selectedException.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b6b6b]">Người báo cáo:</span>
                <span className="font-medium">N.T Yen Nhi (bạn)</span>
              </div>
              <div className="text-sm">
                <span className="text-[#6b6b6b] block mb-1">Mô tả chi tiết:</span>
                <div className="bg-[#f5f5f4] p-3 rounded-md text-[#060606]">
                  "Khách xuất trình CCCD bị mờ, không khớp vé."
                </div>
              </div>
            </div>
          </div>

          {/* MANAGER RESOLUTION */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-4 border-b border-[#e8e9e8] pb-2">Quản lý Giải quyết</h4>
            
            {selectedException.status === 'RESOLVED' && (
              <div className="space-y-3">
                <span className="inline-block bg-[#e8f7f0] text-[#1d7a4a] px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider mb-2">ĐÃ GIẢI QUYẾT ✓</span>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Giải quyết bởi:</span>
                  <span className="font-medium">Quản lý · {selectedException.manager}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Thời gian:</span>
                  <span className="font-medium">25 Th05 2026, 17:12</span>
                </div>
                <div className="text-sm">
                  <span className="text-[#6b6b6b] block mb-1">Ghi chú từ quản lý:</span>
                  <div className="bg-[#e8f7f0]/50 p-3 rounded-md text-[#060606] font-medium border border-[#e8f7f0]">
                    "{selectedException.note}"
                  </div>
                </div>
              </div>
            )}

            {selectedException.status === 'REJECTED' && (
              <div className="space-y-3">
                <span className="inline-block bg-[#fde8e8] text-[#b03030] px-2.5 py-1 rounded-[20px] text-[10px] font-bold uppercase tracking-wider mb-2">TỪ CHỐI</span>
                <div className="text-sm">
                  <span className="text-[#6b6b6b] block mb-1">Lý do từ chối:</span>
                  <div className="bg-[#fde8e8]/50 p-3 rounded-md text-[#060606] font-medium border border-[#fde8e8]">
                    "{selectedException.note}"
                  </div>
                </div>
              </div>
            )}

            {(selectedException.status === 'NEW' || selectedException.status === 'PROCESSING') && (
              <div className="italic text-[#6b6b6b] text-sm py-4">
                Đang chờ quản lý xem xét…
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="flex-1 h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          {selectedException.status === 'RESOLVED' && (
            <button 
              onClick={() => {
                onClose();
                onContinueCheckout(selectedException.plate);
              }}
              className="flex-[2] h-11 bg-[#d7ee46] text-[#060606] font-bold rounded-[8px] hover:brightness-95 transition-all shadow-sm"
            >
              Check-out 🚙
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
