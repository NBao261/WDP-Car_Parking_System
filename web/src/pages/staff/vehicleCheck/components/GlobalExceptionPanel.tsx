import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  exceptionService,
  ExceptionType,
  EXCEPTION_TYPE_LABELS,
} from "../../../../services/exception.service";
import { sessionService } from "../../../../services/session.service";
import { pricingService } from "../../../../services/pricing.service";
import { useEffect } from "react";

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
  const [surcharge, setSurcharge] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm tính năng search session nếu không có currentSession
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedSession, setSearchedSession] = useState<any>(null);

  const activeSession = searchedSession || currentSession;

  const [lostCardFee, setLostCardFee] = useState<number>(0);
  const [isFetchingFee, setIsFetchingFee] = useState(false);

  useEffect(() => {
    if (activeSession?.pricingPlanId?._id && exceptionType === ExceptionType.LOST_CARD) {
      const fetchFee = async () => {
        setIsFetchingFee(true);
        try {
          const res = await pricingService.getById(activeSession.pricingPlanId._id);
          setLostCardFee(res.data.lostCardFee || 0);
        } catch (error) {
          setLostCardFee(0);
        } finally {
          setIsFetchingFee(false);
        }
      };
      fetchFee();
    }
  }, [activeSession, exceptionType]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập Biển số hoặc Mã vé!");
      return;
    }
    setIsSearching(true);
    setSearchedSession(null);
    try {
      const queryStr = searchQuery.trim().toUpperCase();
      let searchParams: any = { licensePlate: queryStr };
      if (queryStr.startsWith("PS-")) {
        searchParams = { code: queryStr };
      } else if (queryStr.startsWith("CARD-")) {
        searchParams = { cardCode: queryStr };
      }
      
      const res = await sessionService.searchSession(searchParams);
      if (res.success && res.data) {
        setSearchedSession(res.data);
        toast.success("Tìm thấy phiên gửi xe hợp lệ!");
      } else {
        toast.error("Không tìm thấy phiên xe đang hoạt động!");
      }
    } catch (error: any) {
      toast.error(error.message || "❌ Tìm kiếm thất bại: Không thể lấy thông tin phiên đỗ xe từ hệ thống.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    // Guard: cần có sessionId thực (MongoDB ObjectId)
    const sessionId = activeSession?._id;
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
      const payload: any = {
        sessionId,
        type: exceptionType,
        description: note.trim(),
      };

      if (exceptionType === ExceptionType.LOST_CARD && lostCardFee === 0 && surcharge !== "") {
        payload.surcharge = Number(surcharge);
      } else if (exceptionType !== ExceptionType.LOST_CARD && surcharge !== "") {
        payload.surcharge = Number(surcharge);
      }

      await exceptionService.createException(payload);

      toast.success("Đã gửi ngoại lệ thành công! Đang chờ Quản lý duyệt.");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "❌ Gửi báo cáo thất bại: Không thể ghi nhận ngoại lệ vào hệ thống.");
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
              {activeSession?._id
                ? `Phiên #${activeSession.code || activeSession._id}`
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
          {/* Form Tìm Kiếm (Nếu không có session) */}
          {!activeSession && (
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-[#060606] mb-2 uppercase tracking-wider">
                Tìm phiên gửi xe
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập biển số hoặc mã vé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-white border border-[#e8e9e8] rounded-[8px] px-4 h-11 text-[14px] font-mono focus:outline-none focus:border-[#060606]"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-11 px-6 bg-[#060606] text-white font-bold rounded-[8px] hover:bg-[#222] transition-colors disabled:opacity-50"
                >
                  {isSearching ? "Tìm..." : "Tìm"}
                </button>
              </div>
            </div>
          )}

          {/* Session context card */}
          {activeSession && (
            <div className="bg-[#f9faf9] rounded-[12px] p-5 mb-8 border border-[#e8e9e8] relative">
              {searchedSession && (
                <button 
                  onClick={() => setSearchedSession(null)}
                  className="absolute top-3 right-3 text-[12px] font-bold text-red-500 hover:text-red-700 underline"
                >
                  Bỏ tìm kiếm
                </button>
              )}
              <div className="bg-white border border-[#e8e9e8] rounded-[8px] p-3 mb-4 text-center shadow-sm">
                <div className="font-mono text-[24px] font-bold text-[#060606] tracking-widest uppercase">
                  {searchedSession ? searchedSession.licensePlate : (coPlateCam || currentSession?.licensePlate || "—")}
                </div>
                <div className="text-sm font-medium text-[#6b6b6b] mt-1">
                  {(activeSession?.vehicleTypeId as any)?.name || "Chưa xác định"}
                </div>
              </div>
              <div className="space-y-2 text-[13px] text-[#6b6b6b] font-medium border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>Biển số vào (Ghi nhận):</span>
                  <span className="text-[#060606] font-mono">
                    {activeSession?.licensePlate || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mã vé:</span>
                  <span className="text-[#060606]">
                    {activeSession?.code || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giờ vào:</span>
                  <span className="text-[#060606]">
                    {activeSession?.checkInTime
                      ? new Date(activeSession.checkInTime).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cổng vào:</span>
                  <span className="text-[#060606]">
                    {activeSession?.gateIn || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

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

            {/* Phí làm lại thẻ */}
            {exceptionType === ExceptionType.LOST_CARD && activeSession?.pricingPlanId && (
              <div className="animate-in fade-in slide-in-from-top-1">
                {isFetchingFee ? (
                  <div className="p-4 bg-gray-50 flex justify-center rounded-[8px]">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : lostCardFee > 0 ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-[8px] flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[13px] font-bold text-orange-900">Phí làm lại thẻ (quy định theo loại xe)</h5>
                      <p className="text-[14px] font-bold text-orange-700 mt-1">
                        {lostCardFee.toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p className="text-[12px] text-orange-800 mt-1">
                        Khoản phí này sẽ tự động được cộng vào tổng tiền khi khách hàng check-out.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-medium text-[#64748b] mb-1.5">
                      Phụ phí làm lại thẻ (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={surcharge}
                      onChange={(e) => setSurcharge(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Quản lý chưa cài đặt mức phí, vui lòng tự nhập (VD: 50000)"
                      className="w-full bg-white border border-[#e8e9e8] rounded-[8px] px-4 h-11 text-[14px] focus:outline-none focus:border-[#060606]"
                    />
                  </div>
                )}
              </div>
            )}

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
            disabled={isSubmitting || !activeSession?._id}
            className="flex-[2] h-11 bg-[#ef4444] text-white font-bold rounded-[8px] hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi Ngoại Lệ"}
          </button>
        </div>
      </div>
    </div>
  );
}
