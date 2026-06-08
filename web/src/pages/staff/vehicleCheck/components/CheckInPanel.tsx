import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { VehicleType } from "../../../../services/vehicleType.service";
import { facilityService } from "../../../../services/facility.service";
import { sessionService } from "../../../../services/session.service";
import { reservationService, IReservation } from "../../../../services/reservation.service";
import { Ticket } from "lucide-react";

interface CheckInPanelProps {
  onCheckIn: (data: any) => void;
}

export default function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const [plate, setPlate] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState("");
  const [step, setStep] = useState<"INPUT" | "PRE_CHECK_RESULT" | "OPEN">("INPUT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreChecking, setIsPreChecking] = useState(false);
  const [preCheckData, setPreCheckData] = useState<IReservation | null>(null);
  const [preCheckStatus, setPreCheckStatus] = useState<"VALID" | "TOO_EARLY" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Lắng nghe Hotkeys
  useEffect(() => {
    const onF2 = () => {
      if (step === "INPUT" && plate.trim().length > 0 && !isSubmitting && !isPreChecking) {
        handlePreCheck();
      } else if (step === "PRE_CHECK_RESULT" && !isSubmitting && preCheckStatus !== "TOO_EARLY") {
        executeCheckIn();
      }
    };

    const onF10 = () => {
      handleReset();
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step !== "OPEN") {
          handleReset();
        } else {
          toast.warning("Dữ liệu xe đã được ghi nhận vào hệ thống. Không thể hủy ngang. Vui lòng nhấn Enter để hoàn tất.");
        }
      }
    };

    window.addEventListener("HOTKEY_F2", onF2);
    window.addEventListener("HOTKEY_F10", onF10);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("HOTKEY_F2", onF2);
      window.removeEventListener("HOTKEY_F10", onF10);
      window.removeEventListener("keydown", onEscape);
    };
  }, [step, plate, isSubmitting, isPreChecking, preCheckStatus]);

  const facilityId = sessionStorage.getItem("staff_facility_id") || "";
  const facilityName = sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  const gateIn = sessionStorage.getItem("staff_gate_name") || `Cổng - ${facilityName}`;

  useEffect(() => {
    if (!facilityId) return;

    facilityService
      .getOperationsConfig(facilityId)
      .then((res) => {
        if (res.success && res.data.allowedVehicleTypes.length > 0) {
          setVehicleTypes(res.data.allowedVehicleTypes);
          setSelectedVehicleTypeId(res.data.allowedVehicleTypes[0]._id);
        } else {
          setVehicleTypes([]);
          setSelectedVehicleTypeId("");
          toast.warning("⚠️ Tòa nhà này chưa được cấu hình Loại xe. Vui lòng liên hệ Quản lý.");
        }
      })
      .catch(() => toast.error("❌ Mất kết nối hệ thống. Không thể tải cấu hình loại xe."));
  }, [facilityId]);

  const handleReset = () => {
    setStep("INPUT");
    setPlate("");
    setPreCheckData(null);
    setPreCheckStatus(null);
    onCheckIn(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handlePreCheck = async () => {
    if (!plate) {
      toast.error("❌ Vui lòng nhập biển số xe trước khi kiểm tra.");
      return;
    }
    if (!facilityId || !selectedVehicleTypeId) {
      toast.error("❌ Chưa cấu hình Loại xe hoặc Tòa nhà. Vui lòng kiểm tra lại thiết lập ca trực.");
      return;
    }

    setIsPreChecking(true);
    try {
      const res = await reservationService.checkReservationByPlate(plate);
      if (res.success && res.data) {
        setPreCheckData(res.data);
        
        const now = new Date().getTime();
        const startTime = new Date(res.data.startTime).getTime();
        const earlyWindow = startTime - 30 * 60 * 1000;
        
        if (now < earlyWindow) {
          setPreCheckStatus("TOO_EARLY");
        } else {
          setPreCheckStatus("VALID");
          toast.info("Có 1 lượt Đặt chỗ hợp lệ cho xe này. Bấm F2 để cho xe vào.");
        }
        
        setStep("PRE_CHECK_RESULT");
      } else {
        // Không có đặt chỗ -> Đi thẳng vào check-in
        await executeCheckIn();
      }
    } catch (error) {
      // Nếu API lỗi, bỏ qua pre-check và thử check-in luôn
      await executeCheckIn();
    } finally {
      setIsPreChecking(false);
    }
  };

  const executeCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await sessionService.checkIn({
        facilityId,
        vehicleTypeId: selectedVehicleTypeId,
        licensePlate: plate,
        gateIn,
        reservationCode: preCheckData?.code, // Truyền mã đặt chỗ nếu có
      });

      if (res.success) {
        const floorName = res.data.floorId?.name || "Tầng Auto";
        const slotCode = res.data.slotId?.code || "Slot Auto";

        // Slot fallback UX
        if (preCheckData && preCheckData.slotId && res.data.slotId) {
          if (preCheckData.slotId.code !== slotCode) {
            toast.warning(`⚠️ Slot đặt trước [${preCheckData.slotId.code}] đang bị chiếm. Đã cấp Slot thay thế: [${slotCode}]. Hướng dẫn khách lên đúng vị trí mới.`, { duration: 8000 });
          } else {
            toast.success(`✅ Đã ghi nhận xe vào. Cấp phát: ${floorName} - Slot: ${slotCode}. Bạn có thể mở chắn.`);
          }
        } else {
          toast.success(`✅ Đã ghi nhận xe vào. Cấp phát: ${floorName} - Slot: ${slotCode}. Bạn có thể mở chắn.`);
        }

        const now = new Date();
        const actualCheckInTime = res.data.checkInTime ? new Date(res.data.checkInTime) : now;
        onCheckIn({
          ticketCode: res.data.code,
          plate: res.data.licensePlate,
          vehicleType: vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name || "",
          checkInTime: actualCheckInTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          checkInDate: actualCheckInTime.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
          gate: gateIn,
          zone: `${floorName} - Slot: ${slotCode}`,
        });
        setStep("OPEN");
      }
    } catch (error: any) {
      toast.error(error.message || "❌ Giao dịch thất bại: Không thể tạo phiên đỗ xe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = () => {
    if (step === "INPUT") {
      handlePreCheck();
    } else if (step === "PRE_CHECK_RESULT" && preCheckStatus !== "TOO_EARLY") {
      executeCheckIn();
    } else if (step === "OPEN") {
      toast.success("✅ Barrier đã mở. Hoàn tất đón xe.");
      handleReset();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Vào</h2>

      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Toà nhà</label>
            <input type="text" value={facilityName} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-[#6b6b6b] mb-1">Cổng trực</label>
            <input type="text" value={gateIn} readOnly
              className="w-full h-8 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[12px] font-medium cursor-not-allowed outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#060606] mb-1">Loại xe</label>
          <select value={selectedVehicleTypeId} onChange={(e) => setSelectedVehicleTypeId(e.target.value)} disabled={step !== "INPUT"}
            className="w-full h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606] disabled:bg-gray-100">
            {vehicleTypes.length === 0 && <option value="">Đang tải...</option>}
            {vehicleTypes.map((vt) => (<option key={vt._id} value={vt._id}>{vt.name}</option>))}
          </select>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          {/* Cảnh báo Đặt chỗ */}
          {step === "PRE_CHECK_RESULT" && preCheckData && (
            <div className={`mb-3 p-3 border rounded-[8px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
              preCheckStatus === "TOO_EARLY" 
                ? "bg-red-50 border-red-400" 
                : "bg-amber-50 border-amber-400"
            }`}>
              <div className="flex flex-col gap-1">
                <span className={`text-[12px] font-bold flex items-center gap-1.5 ${
                  preCheckStatus === "TOO_EARLY" ? "text-red-800" : "text-amber-800"
                }`}>
                  <Ticket className="w-4 h-4" />
                  {preCheckStatus === "TOO_EARLY" ? "ĐẾN SỚM HƠN QUY ĐỊNH" : "ĐÃ ĐẶT CHỖ TRƯỚC"}
                </span>
                <span className={`${preCheckStatus === "TOO_EARLY" ? "text-red-900" : "text-amber-900"} text-[13px] font-medium`}>Mã: {preCheckData.code}</span>
                <span className={`${preCheckStatus === "TOO_EARLY" ? "text-red-700" : "text-amber-700"} text-[11px]`}>
                  Thời gian: {new Date(preCheckData.startTime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})} - {new Date(preCheckData.endTime).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})} ({new Date(preCheckData.startTime).toLocaleDateString("vi-VN", {day: "2-digit", month: "2-digit", year: "numeric"})})
                </span>
              </div>
              <div className="text-right flex flex-col justify-center">
                <span className={`${preCheckStatus === "TOO_EARLY" ? "text-red-800" : "text-amber-800"} text-[11px] font-bold uppercase mb-0.5`}>Vị trí</span>
                <span className={`${preCheckStatus === "TOO_EARLY" ? "text-red-900" : "text-amber-900"} text-[14px] font-black`}>{preCheckData.slotId?.code || "Chưa phân bổ"}</span>
              </div>
            </div>
          )}

          <label className="block text-[12px] font-semibold text-[#060606] mb-1">Biển số xe</label>
          <input
            ref={inputRef}
            type="text" value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleActionClick(); } }}
            disabled={step !== "INPUT" || isSubmitting || isPreChecking}
            className="flex-1 min-h-[50px] w-full text-[28px] font-mono px-4 border border-[#e8e9e8] rounded-[8px] uppercase font-bold text-[#060606] placeholder-gray-300 outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] disabled:opacity-70 disabled:bg-gray-50"
            placeholder="XXX-XXX.XX"
          />
        </div>

        <div className="flex gap-3 h-[42px] shrink-0 mt-2">
          <button onClick={handleReset} disabled={isSubmitting || isPreChecking || step === "OPEN"}
            className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors disabled:opacity-50 text-[13px]">
            Hủy (ESC)
          </button>
          <button onClick={handleActionClick} disabled={isSubmitting || isPreChecking || preCheckStatus === "TOO_EARLY"}
            className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 ${
              step === "OPEN" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38]" 
              : step === "PRE_CHECK_RESULT" ? (preCheckStatus === "TOO_EARLY" ? "bg-red-200 text-red-500 cursor-not-allowed" : "bg-amber-400 text-amber-900 hover:bg-amber-500")
              : "bg-[#d7ee46] text-[#060606] hover:brightness-95"
            }`}>
            {isPreChecking ? "Đang kiểm tra dữ liệu..." 
              : isSubmitting ? "Đang ghi nhận xe vào..." 
              : step === "OPEN" ? "Mở chắn (Enter)" 
              : step === "PRE_CHECK_RESULT" ? (preCheckStatus === "TOO_EARLY" ? "Chưa đến giờ nhận xe" : "F2 - Xe vào (Khách đặt trước)") 
              : "F2 - Xe vào (Khách vãng lai)"}
          </button>
        </div>
      </div>
    </div>
  );
}
