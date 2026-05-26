import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface GlobalExceptionPanelProps {
  coPlateCam: string;
  currentSession?: any;
  onClose: () => void;
}

export default function GlobalExceptionPanel({ coPlateCam, currentSession, onClose }: GlobalExceptionPanelProps) {
  const [exceptionType, setExceptionType] = useState("Sai biển số (Wrong Plate)");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const newException = {
      _id: `exc-${Date.now()}`,
      code: `EXC-${Math.floor(Math.random() * 10000)}`,
      sessionCode: currentSession?.id || "N/A",
      plateIn: currentSession?.plate || "N/A",
      plateOut: coPlateCam || "N/A",
      type: exceptionType,
      status: "pending",
      note: note,
      createdAt: new Date().toISOString()
    };

    const existingStr = localStorage.getItem("mock_exceptions");
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(newException);
    localStorage.setItem("mock_exceptions", JSON.stringify(existing));

    onClose();
    toast.success("Đã gửi ngoại lệ thành công! Đang chờ Quản lý duyệt.");
  };
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-[420px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        <div className="px-6 py-7 border-b border-[#e8e9e8] flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-[18px] font-bold text-[#ef4444] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Báo Cáo Ngoại Lệ
            </h3>
            <p className="text-[12px] text-[#6b6b6b] mt-1">Phiên {currentSession?.id ? `#${currentSession.id}` : 'Không xác định'} · Tự động lấy dữ liệu từ Check-Out</p>
          </div>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-[#f9faf9] rounded-[12px] p-5 mb-8 border border-[#e8e9e8]">
            <div className="bg-white border border-[#e8e9e8] rounded-[8px] p-3 mb-4 text-center shadow-sm">
              <div className="font-mono text-[24px] font-bold text-[#060606] tracking-widest uppercase">
                {coPlateCam || currentSession?.plate || "29A-123.45"}
              </div>
              <div className="text-sm font-medium text-[#6b6b6b] mt-1">{currentSession?.type || "Chưa xác định"}</div>
            </div>
            <div className="space-y-2 text-[13px] text-[#6b6b6b] font-medium border-t border-gray-100 pt-3">
              <div className="flex justify-between"><span>Biển số vào (Ghi nhận):</span> <span className="text-[#060606] font-mono">{currentSession?.plate || "N/A"}</span></div>
              <div className="flex justify-between"><span>Tòa nhà:</span> <span className="text-[#060606]">{currentSession?.zone || sessionStorage.getItem("staff_building") || "N/A"}</span></div>
              <div className="flex justify-between"><span>Tầng/Cổng:</span> <span className="text-[#060606]">{currentSession?.gate || sessionStorage.getItem("staff_gate") || "N/A"}</span></div>
              <div className="flex justify-between"><span>Giờ vào:</span> <span className="text-[#060606]">{currentSession?.time || "N/A"}</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-bold mb-2 text-[#060606]">Loại ngoại lệ</label>
              <select 
                value={exceptionType} 
                onChange={(e) => setExceptionType(e.target.value)}
                className="w-full h-11 bg-white border border-[#e8e9e8] rounded-[8px] px-3 text-[14px] font-medium focus:outline-none focus:border-[#060606]"
              >
                <option>Mất vé (Lost Ticket)</option>
                <option>Sai biển số (Wrong Plate)</option>
                <option>Chưa thanh toán (Unpaid)</option>
                <option>Sai khu vực đỗ (Wrong Zone)</option>
                <option>Lỗi khác (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-[#060606]">Ghi chú (Tùy chọn)</label>
              <textarea 
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border border-[#e8e9e8] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#060606] resize-none"
                placeholder="Mô tả chi tiết nguyên nhân lỗi..."
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-white">
          <button 
            onClick={onClose}
            className="flex-[1] h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-bold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] h-11 bg-[#ef4444] text-white font-bold rounded-[8px] hover:bg-red-600 transition-colors shadow-sm"
          >
            Gửi Ngoại Lệ
          </button>
        </div>
      </div>
    </div>
  );
}
