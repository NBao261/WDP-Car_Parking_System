import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, ScanLine, ImagePlus, RefreshCw, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { sessionService, ParkingSession } from "../../../../services/session.service";

interface CheckOutPanelProps {
  plate: string;
  onChangePlate: (plate: string) => void;
  onCheckOut: (data: any) => void;
  onSearch?: (session: any) => void;
  onFlagException?: () => void;
}

/** Client-side cleanup cho biển số xe sau khi OCR */
function formatPlate(raw: string): string {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  return s;
}

export default function CheckOutPanel({ plate, onChangePlate, onCheckOut, onSearch }: CheckOutPanelProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState<"code" | "plate">("code");
  const [plateIn, setPlateIn] = useState("");
  const [vehicleTypeName, setVehicleTypeName] = useState("Không có dữ liệu");
  const [_checkInTimeDisplay, setCheckInTimeDisplay] = useState("Không có dữ liệu");
  const [step, setStep] = useState<"SEARCH" | "CONFIRM" | "OPEN" | "MISMATCH">("SEARCH");
  const [currentSession, setCurrentSession] = useState<ParkingSession | null>(null);
  const [feeData, setFeeData] = useState<{ totalFee: number; details: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOcrPreviewUrl(URL.createObjectURL(file));
    setOcrSuccess(false);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${API_BASE_URL}/alpr/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success && response.data.data.normalizedPlate) {
        const fp = formatPlate(response.data.data.normalizedPlate);
        setSearchInput(fp);
        setSearchMode("plate");
        setOcrSuccess(true);
        toast.success(`Đã nhận dạng: ${fp} — kiểm tra lại trước khi tìm`);
      } else {
        toast.warning(response.data.message || "Không nhận dạng được. Nhập tay.");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi xử lý ảnh.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearOcrPreview = () => { setOcrPreviewUrl(null); setOcrSuccess(false); };

  // ─── Hotkeys ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onF4 = () => {
      if (step === "SEARCH" && searchInputRef.current) searchInputRef.current.focus();
    };
    const onF8 = () => {
      if (step === "CONFIRM") {
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
  }, [step, isSubmitting]);

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
        const checkInTimeStr = new Date(session.checkInTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        setCheckInTimeDisplay(checkInTimeStr);
        toast.success(searchMode === "plate" ? "Đã tìm thấy thông tin đỗ xe qua Biển số!" : "Đã tìm thấy thông tin vé!");

        // Fetch fee immediately
        const feeRes = await sessionService.calculateFee(session._id);
        let fee = 0;
        let feeDetails = null;
        if (feeRes.success) {
          fee = feeRes.data.totalFee;
          feeDetails = (feeRes.data as any).details ?? null;
          setFeeData({ totalFee: fee, details: feeDetails });
        }

        const checkOutTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const checkOutDateStr = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

        if (onCheckOut) {
          onCheckOut({
            ticketCode: session.code || "—", plateIn: session.licensePlate, plateOut: plate,
            checkInTime: checkInTimeStr, checkOutTime: checkOutTimeStr,
            checkInDate: new Date(session.checkInTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }), 
            checkOutDate: checkOutDateStr,
            gateIn: session.gateIn || "—",
            gateOut: gateOut.trim(), fee, feeDetails: feeDetails,
            paymentStatus: "Chưa thanh toán",
          });
        }

        setStep("CONFIRM");
        if (onSearch) onSearch(session);
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
      if (plate.toUpperCase() !== plateIn.toUpperCase()) return;
      
      setIsSubmitting(true);
      try {
        const checkOutRes = await sessionService.checkOut(currentSession._id, { gateOut: gateOut.trim() });
        if (checkOutRes.success) {
          const actualCheckOutTime = checkOutRes.data.checkOutTime
            ? new Date(checkOutRes.data.checkOutTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          const actualCheckOutDate = checkOutRes.data.checkOutTime
            ? new Date(checkOutRes.data.checkOutTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
            : new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
          
          toast.success("Đã xác nhận thanh toán & mở barie xe ra thành công!");
          onCheckOut((prev: any) => ({ ...prev, checkOutTime: actualCheckOutTime, checkOutDate: actualCheckOutDate, paymentStatus: "Đã thanh toán" }));
          
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
    setOcrPreviewUrl(null); setOcrSuccess(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const isMismatch = step === "CONFIRM" && plate.toUpperCase() !== plateIn.toUpperCase();

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Ra</h2>

      {/* ── STATE: SEARCH / CONFIRM — FORM CHÍNH ── */}
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

          {/* OCR Upload Zone — chỉ hiển thị ở bước SEARCH */}
          {step === "SEARCH" && (
            <div className="flex-1 flex flex-col min-h-0 justify-center">
              {!ocrPreviewUrl ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="w-full flex-1 min-h-[80px] border-2 border-dashed border-[#e8e9e8] rounded-[10px] py-2 flex flex-col items-center justify-center gap-2 text-[#6b6b6b] hover:border-[#d7ee46] hover:bg-[#f9ffe0] hover:text-[#060606] transition-all">
                  {isUploading
                    ? <><RefreshCw className="w-6 h-6 animate-spin text-[#8bc34a]" /><span className="text-[13px] font-semibold text-[#8bc34a]">Đang nhận dạng biển số...</span></>
                    : <><ScanLine className="w-7 h-7 text-[#aaa]" /><span className="text-[13px] font-semibold">Scan ảnh biển số (OCR)</span><span className="text-[11px] text-[#aaa]">Chụp thẳng góc, đủ sáng — tự điền biển số</span></>}
                </button>
              ) : (
                <div className="relative mx-auto rounded-[10px] overflow-hidden border-2 border-[#d7ee46] bg-[#f5f5f4] flex-1 min-h-0" style={{aspectRatio: '1/1', maxHeight: '140px'}}>
                  <img src={ocrPreviewUrl} alt="ocr" className="w-full h-full object-contain" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#d7ee46]" />
                      <span className="text-white text-[11px] font-semibold">Đang nhận dạng...</span>
                    </div>
                  )}
                  {ocrSuccess && <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OCR OK</div>}
                  <button type="button" onClick={clearOcrPreview} className="absolute top-2 right-2 w-5 h-5 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center shadow-md"><X className="w-3 h-3" /></button>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            </div>
          )}

          {/* Tìm kiếm & Loại xe */}
          <div className="flex gap-3">
            <div className="flex-[7] flex flex-col justify-end">
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
                  className="flex-1 w-full min-w-0 h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606] disabled:opacity-50" />
                <button onClick={handleSearch} disabled={isSubmitting || step !== "SEARCH"}
                  className="px-3 bg-gray-100 hover:bg-gray-200 border border-[#e8e9e8] rounded-[6px] text-[#060606] transition-colors disabled:opacity-50 shrink-0">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-[3] flex flex-col justify-end">
              <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Loại xe</label>
              <input type="text" value={vehicleTypeName} readOnly
                className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
            </div>
          </div>

          {/* Biển số xe ra */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-semibold text-[#060606]">Biển số xe ra</label>
              {step === "CONFIRM" && <span className="text-[10px] text-[#1d7a4a] font-medium">✓ Tự động điền từ hệ thống</span>}
            </div>
            <input type="text" value={plate}
              onChange={(e) => onChangePlate(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={step === "SEARCH" || isSubmitting}
              placeholder="(đã tự động điền)"
              className={`flex-1 w-full text-[24px] font-mono px-4 border rounded-[8px] uppercase font-bold outline-none transition-colors 
                ${step === "CONFIRM" ? (isMismatch ? "bg-[#fef2f2] border-[#DF0101] text-[#DF0101] focus:border-[#DF0101]" : "bg-[#f0fdf4] border-[#1d7a4a] text-[#1d7a4a] focus:border-[#155d38]") : "bg-[#f5f5f4] border-[#e8e9e8] text-[#9b9b9b]"}`} />
          </div>
          {/* Hiển thị Phí ngay trên Form để Staff thấy và thu tiền (chỉ khi đúng biển số) */}
          {step === "CONFIRM" && feeData && !isMismatch && (
            <div className="mt-2 bg-[#e8f7f0] border border-[#1d7a4a] rounded-[8px] p-3 flex flex-col items-center justify-center">
               <div className="text-[13px] font-bold text-[#1d7a4a] mb-1">SỐ TIỀN CẦN THU</div>
               <div className="text-[32px] font-bold text-[#060606]">
                 {feeData.totalFee.toLocaleString("vi-VN")} ₫
               </div>
               {feeData.details && (
                 <div className="mt-1 text-[11px] text-[#6b6b6b] flex gap-3 text-center">
                   <span>Thời gian đỗ: {feeData.details.durationHours} giờ</span>
                   {feeData.details.overnightFee > 0 && <span>Qua đêm: {feeData.details.overnightFee?.toLocaleString("vi-VN")} ₫</span>}
                 </div>
               )}
            </div>
          )}
        </div>

      {/* Nút hành động */}
      <div className="flex gap-3 h-[42px] shrink-0 mt-3">
        <button onClick={handleReset} disabled={isSubmitting}
          className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors disabled:opacity-50">
          Hủy
        </button>
        <button onClick={step === "SEARCH" ? handleSearch : handleCheckOut}
          disabled={(step === "SEARCH" && !searchInput) || isSubmitting || isMismatch}
          className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm 
            ${isMismatch ? "bg-[#DF0101] text-white disabled:opacity-100 cursor-not-allowed" 
            : step === "CONFIRM" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38] disabled:opacity-50"
                : "bg-[#d7ee46] text-[#060606] hover:brightness-95 disabled:opacity-50"}`}>
          {isSubmitting ? "Đang xử lý..."
            : isMismatch ? "Không khớp biển số lúc vào"
            : step === "CONFIRM" ? "Mở chắn"
                  : "Tìm xe"}
        </button>
      </div>
    </div>
  );
}
