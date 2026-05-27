import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { sessionService, ParkingSession } from "../../../../services/session.service";

interface CheckOutPanelProps {
  plate: string;
  onChangePlate: (plate: string) => void;
  onCheckOut: (data: any) => void;
  onSearch?: (session: any) => void;
  onFlagException?: () => void;
}

export default function CheckOutPanel({ plate, onChangePlate, onCheckOut, onSearch, onFlagException }: CheckOutPanelProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState<"code" | "plate">("code");
  const [plateIn, setPlateIn] = useState("");
  const [vehicleTypeName, setVehicleTypeName] = useState("Không có dữ liệu");
  const [checkInTimeDisplay, setCheckInTimeDisplay] = useState("Không có dữ liệu");
  const [step, setStep] = useState<"SEARCH" | "CONFIRM" | "OPEN" | "MISMATCH">("SEARCH");
  const [currentSession, setCurrentSession] = useState<ParkingSession | null>(null);
  const [feeData, setFeeData] = useState<{ totalFee: number; details: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Hotkeys ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onF4 = () => {
      if (step === "SEARCH" && searchInputRef.current) searchInputRef.current.focus();
    };
    const onF8 = () => {
      if ((step === "CONFIRM" && plate.trim().length > 0) || step === "OPEN") {
        if (!isSubmitting) handleCheckOut();
      }
    };
    const onF10 = () => handleReset();

    window.addEventListener("HOTKEY_F4", onF4);
    window.addEventListener("HOTKEY_F8", onF8);
    window.addEventListener("HOTKEY_F10", onF10);
    return () => {
      window.removeEventListener("HOTKEY_F4", onF4);
      window.removeEventListener("HOTKEY_F8", onF8);
      window.removeEventListener("HOTKEY_F10", onF10);
    };
  }, [step, plate, isSubmitting]);

  // ─── Terminal session info ──────────────────────────────────────────────────
  const building = sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  const gateOut = sessionStorage.getItem("staff_gate_name") || `Cổng - ${building}`;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) {
      toast.error(searchMode === "code" ? "Vui lòng nhập mã vé!" : "Vui lòng nhập biển số xe!");
      return;
    }
    setIsSubmitting(true);
    try {
      const params = searchMode === "code" ? { code: query } : { licensePlate: query };
      const res = await sessionService.searchSession(params);
      if (res.success && res.data) {
        const session = res.data;
        setCurrentSession(session);
        setPlateIn(session.licensePlate);
        const vehicleTypeObj = session.vehicleTypeId as any;
        setVehicleTypeName(vehicleTypeObj?.name || "Không xác định");
        setCheckInTimeDisplay(
          new Date(session.checkInTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        );
        toast.success(searchMode === "plate" ? "Đã tìm thấy thông tin đỗ xe qua Biển số!" : "Đã tìm thấy thông tin vé!");
        setStep("CONFIRM");
        if (onSearch) onSearch(session);
        // Cả 2 mode đều auto-fill plate từ DB — code mode không cần staff nhập lại
        onChangePlate(session.licensePlate);
      }
    } catch (error: any) {
      toast.error(error.message || "Không tìm thấy trong hệ thống!");
      setPlateIn("");
      setVehicleTypeName("Không có dữ liệu");
      setCurrentSession(null);
      if (onSearch) onSearch(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (step === "CONFIRM") {
      if (!currentSession) return;
      // Khi tìm bằng biển số thủ công (mất vé): kiểm tra xem plate nhập khớp DB
      if (searchMode === "plate") {
        const isMatch = plateIn.toUpperCase() === plate.toUpperCase();
        if (!isMatch) {
          toast.error("Không khớp biển số! Vui lòng kiểm tra lại hoặc báo cáo ngoại lệ.");
          setStep("MISMATCH");
          return;
        }
      }
      // Khi tìm bằng mã vé: plate đã được auto-fill từ DB, không cần kiểm tra
      setIsSubmitting(true);
      try {
        const feeRes = await sessionService.calculateFee(currentSession._id);
        if (feeRes.success) {
          const fee = feeRes.data.totalFee;
          setFeeData({ totalFee: fee, details: feeRes.data.details });
          const checkOutTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          onCheckOut({
            ticketCode: searchInput, plateIn, plateOut: plate,
            checkInTime: checkInTimeDisplay, checkOutTime: checkOutTimeStr,
            gateOut: gateOut.trim(), fee, feeDetails: feeRes.data.details,
            paymentStatus: "Chưa thanh toán",
          });
          setStep("OPEN");
        }
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi tính phí đỗ xe!");
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === "OPEN") {
      if (!currentSession) return;
      setIsSubmitting(true);
      try {
        const checkOutRes = await sessionService.checkOut(currentSession._id, { gateOut: gateOut.trim() });
        if (checkOutRes.success) {
          const actualCheckOutTime = checkOutRes.data.checkOutTime
            ? new Date(checkOutRes.data.checkOutTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          toast.success("Đã xác nhận thanh toán & mở barie xe ra thành công!");
          onCheckOut((prev: any) => ({ ...prev, checkOutTime: actualCheckOutTime, paymentStatus: "Đã thanh toán" }));
          setSearchInput(""); setPlateIn(""); onChangePlate("");
          setVehicleTypeName("Không có dữ liệu"); setCheckInTimeDisplay("Không có dữ liệu");
          setCurrentSession(null); setFeeData(null); setStep("SEARCH");
          setTimeout(() => { onCheckOut(null); }, 2000);
        }
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi check-out!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === "SEARCH") handleSearch();
      else handleCheckOut();
    }
  };

  const handleReset = () => {
    setStep("SEARCH"); setSearchInput(""); setPlateIn(""); onChangePlate("");
    setCurrentSession(null); setFeeData(null);
    setVehicleTypeName("Không có dữ liệu"); setCheckInTimeDisplay("Không có dữ liệu");
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Ra</h2>

      {/* ── STATE: TRÙNG KHỚP + PHÍ ── */}
      {step === "OPEN" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#e8f7f0] rounded-[8px] border border-[#1d7a4a] mb-3">
          <CheckCircle2 className="w-12 h-12 text-[#1d7a4a] mb-1" />
          <h3 className="text-[18px] font-bold text-[#1d7a4a] mb-1">TRÙNG KHỚP</h3>
          <div className="text-[36px] font-bold text-[#060606]">
            {feeData ? feeData.totalFee.toLocaleString("vi-VN") : 0} ₫
          </div>
          {feeData?.details && (
            <div className="mt-2 text-[11px] text-[#6b6b6b] text-center space-y-0.5">
              <div>Thời gian đỗ: <span className="font-medium text-[#060606]">{feeData.details.durationHours} giờ</span></div>
              <div>Phí cơ bản: <span className="font-medium text-[#060606]">{feeData.details.baseFee?.toLocaleString("vi-VN")} ₫</span></div>
              {feeData.details.overnightFee > 0 && (
                <div>Phí qua đêm: <span className="font-medium text-[#b45309]">{feeData.details.overnightFee?.toLocaleString("vi-VN")} ₫</span></div>
              )}
              {feeData.details.exceptionSurcharge > 0 && (
                <div>Phụ phí ngoại lệ: <span className="font-medium text-[#b03030]">{feeData.details.exceptionSurcharge?.toLocaleString("vi-VN")} ₫</span></div>
              )}
            </div>
          )}
        </div>

        /* ── STATE: KHÔNG KHỚP BIỂN SỐ ── */
      ) : step === "MISMATCH" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#fef2f2] rounded-[8px] border border-[#ef4444] mb-3 gap-2">
          <XCircle className="w-12 h-12 text-[#ef4444]" />
          <h3 className="text-[18px] font-bold text-[#ef4444]">KHÔNG KHỚP BIỂN SỐ</h3>
          <p className="text-[12px] text-[#6b6b6b] text-center px-4">
            Biển số xe ra <span className="font-bold text-[#060606]">{plate.toUpperCase()}</span> không khớp với biển số khi vào <span className="font-bold text-[#060606]">{plateIn.toUpperCase()}</span>
          </p>
          {onFlagException && (
            <button onClick={onFlagException}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#f97316] text-white font-semibold rounded-[8px] hover:bg-[#ea6c0a] transition-colors text-[12px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              Tạo Báo Cáo Ngoại Lệ
            </button>
          )}
        </div>

        /* ── STATE: SEARCH / CONFIRM — FORM CHÍNH ── */
      ) : (
        <div className="flex flex-col gap-2.5 flex-1 min-h-0">
          {/* Toà nhà + Cổng trực */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Toà nhà</label>
              <input type="text" value={building} readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Cổng trực</label>
              <input type="text" value={gateOut} readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
            </div>
          </div>

          {/* Tìm kiếm theo mã vé / biển số */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#6b6b6b]">
                {searchMode === "code" ? "Mã vé xe" : "Biển số xe (tìm kiếm)"}
              </label>
              <button onClick={() => { setSearchMode(m => m === "code" ? "plate" : "code"); setSearchInput(""); }}
                disabled={step !== "SEARCH"}
                className="text-[10px] text-[#2563eb] underline disabled:opacity-40 hover:no-underline">
                {searchMode === "code" ? "Khách mất vé? Tìm theo biển số" : "← Quay lại tìm theo mã vé"}
              </button>
            </div>
            <div className="flex gap-2">
              <input ref={searchInputRef} type="text" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder={searchMode === "code" ? "VD: TKT-12345" : "VD: 29A-12345"}
                disabled={isSubmitting || step !== "SEARCH"}
                className="flex-1 h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606] disabled:opacity-50" />
              <button onClick={handleSearch} disabled={isSubmitting || step !== "SEARCH"}
                className="px-3 bg-gray-100 hover:bg-gray-200 border border-[#e8e9e8] rounded-[6px] text-[#060606] transition-colors disabled:opacity-50">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loại xe + Giờ vào */}
          <div className="flex gap-3">
            <div className="flex-[4] flex flex-col">
              <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Loại xe</label>
              <input type="text" value={vehicleTypeName} readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
            </div>
            <div className="flex-[3] flex flex-col">
              <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Giờ vào</label>
              <input type="text" value={checkInTimeDisplay} readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
            </div>
          </div>

          {/* Biển số xe — tùy theo chế độ tìm kiếm */}
          {searchMode === "code" ? (
            // ─ Code mode: plate đã từ DB, hiển thị to để đối chiếu nhanh ─
            <div className="flex-1 flex flex-col">
              <label className="block text-[12px] font-semibold text-[#060606] mb-1">
                Biển số xe
                {step === "CONFIRM" && <span className="ml-2 text-[10px] text-[#1d7a4a] font-medium">✓ Xác nhận từ hệ thống</span>}
              </label>
              <div className={`flex-1 flex items-center px-4 border rounded-[8px] font-mono font-bold text-[28px] uppercase
                ${step === "CONFIRM" ? "bg-[#f0fdf4] border-[#1d7a4a] text-[#1d7a4a]" : "bg-[#f5f5f4] border-[#e8e9e8] text-[#9b9b9b]"}`}>
                {plateIn || "—"}
              </div>
            </div>
          ) : (
            // ─ Plate mode (mất vé): hiển thị cả plateIn nhỏ + plate lớn auto-fill ─
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Biển số (Vào)</label>
                <input type="text" value={plateIn} readOnly placeholder="Nhập biển số để tải..."
                  className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#060606] text-[13px] font-mono font-bold cursor-not-allowed outline-none uppercase" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-[#060606]">Biển số xe ra</label>
                  {step === "CONFIRM" && <span className="text-[10px] text-[#1d7a4a] font-medium">✓ Tự động điền từ tìm kiếm</span>}
                </div>
                <input type="text" value={plate}
                  onChange={(e) => onChangePlate(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  disabled={step === "SEARCH" || isSubmitting || step === "CONFIRM"}
                  placeholder="(đã tự động điền)"
                  className="flex-1 w-full text-[24px] font-mono px-4 border rounded-[8px] uppercase font-bold outline-none transition-colors bg-[#f0fdf4] border-[#1d7a4a] text-[#1d7a4a] cursor-not-allowed" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Nút hành động */}
      <div className="flex gap-3 h-[42px] shrink-0 mt-3">
        <button onClick={handleReset} disabled={isSubmitting}
          className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors disabled:opacity-50">
          Hủy
        </button>
        <button onClick={step === "SEARCH" ? handleSearch : handleCheckOut}
          disabled={(step === "SEARCH" && !searchInput) || step === "MISMATCH" || isSubmitting}
          className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm disabled:opacity-50
            ${step === "OPEN" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38]"
              : step === "MISMATCH" ? "bg-[#ef4444] text-white cursor-not-allowed"
                : "bg-[#d7ee46] text-[#060606] hover:brightness-95"}`}>
          {isSubmitting ? "Đang xử lý..."
            : step === "OPEN" ? "Mở chắn"
              : step === "MISMATCH" ? "Không khớp"
                : step === "SEARCH" ? "Tìm vé"
                  : "Xe ra"}
        </button>
      </div>
    </div>
  );
}
