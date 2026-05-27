import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import {
  exceptionService,
  ExceptionType,
  EXCEPTION_TYPE_LABELS,
} from "../../../../services/exception.service";

interface GlobalExceptionPanelProps {
  coPlateCam: string;
  currentSession?: any;  // ParkingSession object từ sessionService.searchSession()
  onClose: () => void;
}

export default function GlobalExceptionPanel({
  coPlateCam,
  currentSession,
  onClose,
}: GlobalExceptionPanelProps) {
  const [exceptionType, setExceptionType] = useState<ExceptionType>(
    ExceptionType.WRONG_PLATE
  );
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Guard: cần có sessionId thực (MongoDB ObjectId)
    const sessionId = currentSession?._id;
    if (!sessionId) {
      toast.error(
        "Không xác định được phiên gửi xe. Vui lòng tìm kiếm vé trước khi báo ngoại lệ!"
      );
      return;
    }

    if (!note.trim()) {
      toast.error("Vui lòng mô tả chi tiết tình huống ngoại lệ!");
      return;
    }

    setIsSubmitting(true);
    try {
      await exceptionService.createException({
        sessionId,
        type: exceptionType,
        description: note.trim(),
      });

      toast.success("Đã gửi ngoại lệ thành công! Đang chờ Quản lý duyệt.");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi gửi ngoại lệ, thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-[420px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-7 border-b border-[#e8e9e8] flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-[18px] font-bold text-[#ef4444] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Báo Cáo Ngoại Lệ
            </h3>
            <p className="text-[12px] text-[#6b6b6b] mt-1">
              {currentSession?._id
                ? `Phiên #${currentSession.code || currentSession._id} · Tự động lấy dữ liệu từ Check-Out`
                : "⚠ Không có phiên xe — hãy tìm vé trước"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Session context card */}
          <div className="bg-[#f9faf9] rounded-[12px] p-5 mb-8 border border-[#e8e9e8]">
            <div className="bg-white border border-[#e8e9e8] rounded-[8px] p-3 mb-4 text-center shadow-sm">
              <div className="font-mono text-[24px] font-bold text-[#060606] tracking-widest uppercase">
                {coPlateCam || currentSession?.licensePlate || "29A-123.45"}
              </div>
              <div className="text-sm font-medium text-[#6b6b6b] mt-1">
                {(currentSession?.vehicleTypeId as any)?.name || "Chưa xác định"}
              </div>
            </div>
            <div className="space-y-2 text-[13px] text-[#6b6b6b] font-medium border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Biển số vào (Ghi nhận):</span>
                <span className="text-[#060606] font-mono">
                  {currentSession?.licensePlate || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biển số ra (Hiện tại):</span>
                <span className="text-[#060606] font-mono">
                  {coPlateCam || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mã vé:</span>
                <span className="text-[#060606]">
                  {currentSession?.code || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giờ vào:</span>
                <span className="text-[#060606]">
                  {currentSession?.checkInTime
                    ? new Date(currentSession.checkInTime).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cổng vào:</span>
                <span className="text-[#060606]">
                  {currentSession?.gateIn ||
                    sessionStorage.getItem("staff_gate_name") ||
                    "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-bold mb-2 text-[#060606]">
                Loại ngoại lệ
              </label>
              <select
                value={exceptionType}
                onChange={(e) => setExceptionType(e.target.value as ExceptionType)}
                className="w-full h-11 bg-white border border-[#e8e9e8] rounded-[8px] px-3 text-[14px] font-medium focus:outline-none focus:border-[#060606]"
              >
                {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-2 text-[#060606]">
                Mô tả chi tiết tình huống{" "}
                <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border border-[#e8e9e8] rounded-[8px] p-3 text-[14px] focus:outline-none focus:border-[#060606] resize-none"
                placeholder="Mô tả chi tiết nguyên nhân lỗi, tình huống xảy ra..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-white">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-[1] h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentSession?._id}
            className="flex-[2] h-11 bg-[#ef4444] text-white font-bold rounded-[8px] hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi Ngoại Lệ"}
          </button>
        </div>
      </div>
    </div>
  );
}
