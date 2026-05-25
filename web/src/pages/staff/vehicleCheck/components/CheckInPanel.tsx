import { useState } from "react";
import { toast } from "sonner";

interface CheckInPanelProps {
  onCheckIn: (data: any) => void;
}

export default function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("Ô tô (Car)");
  const [step, setStep] = useState<"INPUT" | "OPEN">("INPUT");
  
  const building = sessionStorage.getItem("staff_building") || "Topaz 2";
  const gate = sessionStorage.getItem("staff_gate") || "Gate 1 (Basement 1)";

  const handleCheckIn = () => {
    if (step === "INPUT") {
      if (!plate) {
        toast.error("Vui lòng nhập biển số xe!");
        return;
      }
      
      const newTicket = {
        ticketCode: `TKT-${Math.floor(Math.random() * 100000)}`,
        plate: plate,
        vehicleType: vehicleType,
        checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        gate: gate,
        zone: building
      };
      
      onCheckIn(newTicket);
      toast.success("Đã tiếp nhận xe vào! Vui lòng mở chắn.");
      setStep("OPEN");

      // Save to localStorage for mock API sessions
      const existing = JSON.parse(localStorage.getItem("mock_active_sessions") || "[]");
      existing.push({
        id: newTicket.ticketCode,
        plate: newTicket.plate,
        type: newTicket.vehicleType,
        gate: newTicket.gate,
        zone: newTicket.zone,
        time: newTicket.checkInTime,
        timestamp: new Date().toISOString(),
        status: "ACTIVE"
      });
      localStorage.setItem("mock_active_sessions", JSON.stringify(existing));

    } else if (step === "OPEN") {
      toast.success("Đã mở chắn thành công!");
      setStep("INPUT");
      setPlate("");
      onCheckIn(null); // Clear confirm panel optionally, or keep it until next input
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 p-5 h-full min-h-0 overflow-hidden">
      <h2 className="text-xl font-bold text-[#060606] mb-4 shrink-0">Đăng Ký Xe Vào</h2>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-[12px] font-semibold text-[#6b6b6b] mb-1">Tòa nhà</label>
          <input 
            type="text" 
            value={building} 
            readOnly 
            className="w-full h-9 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[13px] font-medium cursor-not-allowed outline-none" 
          />
        </div>
        <div className="flex-1">
          <label className="block text-[12px] font-semibold text-[#6b6b6b] mb-1">Tầng / Cổng</label>
          <input 
            type="text" 
            value={gate} 
            readOnly 
            className="w-full h-9 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[13px] font-medium cursor-not-allowed outline-none" 
          />
        </div>
      </div>

        <div className="mb-4">
          <label className="block text-[12px] font-semibold text-[#060606] mb-1">Loại xe</label>
          <select 
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full h-9 px-3 border border-[#e8e9e8] rounded-[6px] text-[13px] font-medium outline-none focus:border-[#060606]"
          >
            <option>Ô tô (Car)</option>
            <option>Xe máy (Motorbike)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#060606] mb-1.5">Biển số xe</label>
          <input 
            type="text" 
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCheckIn();
              }
            }}
            disabled={step === "OPEN"}
            className="w-full h-14 text-[22px] font-mono px-4 border border-[#e8e9e8] rounded-[8px] uppercase font-bold text-[#060606] placeholder-gray-300 outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] disabled:opacity-50" 
            placeholder="29A-123.45" 
          />
        </div>
      </div>

      <div className="flex gap-3 h-[44px] shrink-0 mt-4">
        <button 
          onClick={() => {
            setStep("INPUT");
            setPlate("");
          }}
          className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button 
          onClick={handleCheckIn}
          className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm
            ${step === "OPEN" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38]" : "bg-[#d7ee46] text-[#060606] hover:brightness-95"}`}
        >
          {step === "OPEN" ? "Mở chắn" : "Xe vào"}
        </button>
      </div>
    </div>
  );
}
