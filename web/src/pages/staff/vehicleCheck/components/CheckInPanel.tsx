import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VehicleType } from "../../../../services/vehicleType.service";
import { facilityService } from "../../../../services/facility.service";
import { sessionService } from "../../../../services/session.service";

interface CheckInPanelProps {
  onCheckIn: (data: any) => void;
}

export default function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const [plate, setPlate] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState("");
  const [step, setStep] = useState<"INPUT" | "OPEN">("INPUT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lắng nghe Hotkeys
  useEffect(() => {
    const onF2 = () => {
      // Chỉ check-in khi đã nhập đủ biển số và đang ở bước 1
      if (step === "INPUT" && plate.trim().length > 0 && !isSubmitting) {
        handleCheckIn();
      }
    };

    const onF10 = () => {
      handleReset();
    };

    window.addEventListener("HOTKEY_F2", onF2);
    window.addEventListener("HOTKEY_F10", onF10);
    return () => {
      window.removeEventListener("HOTKEY_F2", onF2);
      window.removeEventListener("HOTKEY_F10", onF10);
    };
  }, [step, plate, isSubmitting]);

  // ─── Terminal Session (từ sessionStorage, set lúc chọn ca) ────────────────
  const facilityId = sessionStorage.getItem("staff_facility_id") || "";
  const facilityName =
    sessionStorage.getItem("staff_facility_name") || "Chưa chọn Toà nhà";
  // gateIn được auto-sinh khi staff chọn ca → nhất quán, không cần nhập tay
  const gateIn =
    sessionStorage.getItem("staff_gate_name") || `Cổng - ${facilityName}`;

  useEffect(() => {
    if (!facilityId) return;

    facilityService
      .getOperationsConfig(facilityId)
      .then((res) => {
        if (res.success && res.data.allowedVehicleTypes.length > 0) {
          setVehicleTypes(res.data.allowedVehicleTypes);
          setSelectedVehicleTypeId(res.data.allowedVehicleTypes[0]._id);
        } else {
          // Toà nhà chưa có cấu hình loại xe nào
          setVehicleTypes([]);
          setSelectedVehicleTypeId("");
          toast.warning("Toà nhà này chưa được cấu hình loại xe. Liên hệ Admin.");
        }
      })
      .catch(() => toast.error("Không thể tải cấu hình loại xe"));
  }, [facilityId]);

  const handleCheckIn = async () => {
    if (step === "INPUT") {
      if (!plate) {
        toast.error("Vui lòng nhập biển số xe!");
        return;
      }
      if (!facilityId || !selectedVehicleTypeId) {
        toast.error("Thiếu thông tin vị trí trực hoặc loại xe. Vui lòng đăng nhập lại!");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await sessionService.checkIn({
          facilityId,
          vehicleTypeId: selectedVehicleTypeId,
          licensePlate: plate,
          gateIn, // auto-generated, không cần staff nhập
          // floorId không truyền → Backend auto-assign slot tối ưu
        });

        if (res.success) {
          const floorName = res.data.floorId?.name || "Tầng Auto";
          const slotCode = res.data.slotId?.code || "Slot Auto";

          const now = new Date();
          const actualCheckInTime = res.data.checkInTime ? new Date(res.data.checkInTime) : now;
          onCheckIn({
            ticketCode: res.data.code,
            plate: res.data.licensePlate,
            vehicleType:
              vehicleTypes.find((v) => v._id === selectedVehicleTypeId)?.name || "",
            checkInTime: actualCheckInTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            checkInDate: actualCheckInTime.toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric"
            }),
            gate: gateIn,
            zone: `${floorName} - Slot: ${slotCode}`,
          });
          toast.success(`Đã cấp phát: ${floorName} - Slot: ${slotCode}. Vui lòng mở chắn.`);
          setStep("OPEN");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi tạo phiên đỗ xe!");
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === "OPEN") {
      toast.success("Đã mở chắn thành công!");
      setStep("INPUT");
      setPlate("");
      onCheckIn(null);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 px-5 pt-4 pb-4 h-full min-h-0 overflow-hidden">
      <h2 className="text-[17px] font-bold text-[#060606] mb-3 shrink-0">Đăng Ký Xe Vào</h2>

      {/* Form — không scroll, dùng gap đều */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Toà nhà + Cổng trực */}
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

        {/* Loại xe */}
        <div>
          <label className="block text-[11px] font-semibold text-[#060606] mb-1">Loại xe</label>
          <select value={selectedVehicleTypeId} onChange={(e) => setSelectedVehicleTypeId(e.target.value)}
            className="w-full h-8 px-3 border border-[#e8e9e8] rounded-[6px] text-[12px] font-medium outline-none focus:border-[#060606]">
            {vehicleTypes.length === 0 && <option value="">Đang tải...</option>}
            {vehicleTypes.map((vt) => (<option key={vt._id} value={vt._id}>{vt.name}</option>))}
          </select>
        </div>

        {/* Biển số xe — ô nhập lớn làm điểm nhấn */}
        <div className="flex-1 flex flex-col">
          <label className="block text-[12px] font-semibold text-[#060606] mb-1">Biển số xe</label>
          <input
            type="text" value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCheckIn(); } }}
            disabled={step === "OPEN" || isSubmitting}
            className="flex-1 w-full text-[28px] font-mono px-4 border border-[#e8e9e8] rounded-[8px] uppercase font-bold text-[#060606] placeholder-gray-300 outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] disabled:opacity-50"
            placeholder="XXX-XXX.XX"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 h-[42px] shrink-0">
          <button onClick={() => { setStep("INPUT"); setPlate(""); }} disabled={isSubmitting}
            className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button onClick={handleCheckIn} disabled={isSubmitting}
            className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm disabled:opacity-70 ${step === "OPEN" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38]" : "bg-[#d7ee46] text-[#060606] hover:brightness-95"
              }`}>
            {isSubmitting ? "Đang xử lý..." : step === "OPEN" ? "Mở chắn" : "Xe vào"}
          </button>
        </div>
      </div>
    </div>
  );
}
