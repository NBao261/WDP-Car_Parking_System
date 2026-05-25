import { useState } from "react";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle } from "lucide-react";

interface CheckOutPanelProps {
  plate: string;
  onChangePlate: (plate: string) => void;
  onCheckOut: (data: any) => void;
  onSearch?: (session: any) => void;
}

export default function CheckOutPanel({ plate, onChangePlate, onCheckOut, onSearch }: CheckOutPanelProps) {
  const [ticketCode, setTicketCode] = useState("");
  const [plateIn, setPlateIn] = useState("");
  const [vehicleType, setVehicleType] = useState("Không có dữ liệu");
  const [step, setStep] = useState<"SEARCH" | "CONFIRM" | "OPEN" | "MISMATCH">("SEARCH");
  const building = sessionStorage.getItem("staff_building") || "Topaz 2";
  const gate = sessionStorage.getItem("staff_gate") || "Gate 1 (Basement 1)";
  const today = new Date().toLocaleDateString('vi-VN');

  const handleSearch = () => {
    if (!ticketCode) {
      toast.error("Vui lòng nhập mã vé!");
      return;
    }
    
    // Read from localStorage to find real mock ticket
    const existingStr = localStorage.getItem("mock_active_sessions");
    let foundTicket = null;
    if (existingStr) {
      const existing = JSON.parse(existingStr);
      foundTicket = existing.find((s: any) => s.id === ticketCode);
    }

    if (foundTicket) {
      setPlateIn(foundTicket.plate);
      setVehicleType(foundTicket.type);
      toast.success("Đã tìm thấy thông tin vé!");
      setStep("CONFIRM");
      if (onSearch) onSearch(foundTicket);
    } else {
      // Fallback for testing if no ticket found
      toast.error("Không tìm thấy mã vé trong hệ thống!");
      setPlateIn("");
      setVehicleType("Không có dữ liệu");
      if (onSearch) onSearch(null);
    }
  };

  const handleCheckOut = () => {
    if (step === "CONFIRM") {
      if (!plate) {
        toast.error("Vui lòng nhập biển số xe ra!");
        return;
      }
      
      const isMatch = plateIn === plate;
      if (!isMatch) {
        toast.error("Không khớp biển số! Vui lòng kiểm tra lại hoặc báo cáo ngoại lệ.");
        setStep("MISMATCH");
        return;
      }

      const checkInTimeStr = new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const checkOutTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      onCheckOut({
        ticketCode,
        plateIn,
        plateOut: plate,
        checkInTime: checkInTimeStr,
        checkOutTime: checkOutTimeStr,
        gateOut: gate,
        fee: 10000,
        paymentStatus: "Chưa thanh toán"
      });
      setStep("OPEN");
    } else if (step === "OPEN") {
      toast.success("Đã xác nhận thanh toán & mở barie xe ra thành công!");
      onCheckOut((prev: any) => ({ ...prev, paymentStatus: "Đã thanh toán" }));
      
      // Remove from localStorage mock API
      const existingStr = localStorage.getItem("mock_active_sessions");
      if (existingStr) {
        let existing = JSON.parse(existingStr);
        existing = existing.filter((s: any) => s.id !== ticketCode);
        localStorage.setItem("mock_active_sessions", JSON.stringify(existing));
      }

      // Reset
      setTicketCode("");
      setPlateIn("");
      onChangePlate("");
      setVehicleType("Không có dữ liệu");
      setStep("SEARCH");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleCheckOut();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] shadow-lg shadow-blue-500/20 p-5 h-full min-h-0 overflow-hidden">
      <h2 className="text-xl font-bold text-[#060606] mb-4 shrink-0">Đăng Ký Xe Ra</h2>
      
      {step === "OPEN" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#e8f7f0] rounded-[8px] border border-[#1d7a4a] mb-4">
          <CheckCircle2 className="w-16 h-16 text-[#1d7a4a] mb-3" />
          <h3 className="text-[24px] font-bold text-[#1d7a4a] mb-2">TRÙNG KHỚP</h3>
          <div className="text-[40px] font-bold text-[#060606]">10,000 ₫</div>
        </div>
      ) : step === "MISMATCH" ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#fef2f2] rounded-[8px] border border-[#ef4444] mb-4">
          <XCircle className="w-16 h-16 text-[#ef4444] mb-3" />
          <h3 className="text-[24px] font-bold text-[#ef4444] mb-2">KHÔNG KHỚP</h3>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {/* Read-only info box */}
        <div className="bg-[#f9faf9] p-3 rounded-[8px] border border-[#e8e9e8] mb-4 flex gap-4 text-[12px]">
          <div className="flex-1 flex flex-col"><span className="text-[#6b6b6b] mb-0.5">Tòa nhà:</span> <span className="font-semibold text-[#060606] text-[13px]">{building}</span></div>
          <div className="flex-1 flex flex-col"><span className="text-[#6b6b6b] mb-0.5">Cổng / Tầng:</span> <span className="font-semibold text-[#060606] text-[13px]">{gate}</span></div>
        </div>

        <div className="mb-4">
          <label className="block text-[12px] font-semibold text-[#6b6b6b] mb-1">Mã vé xe</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="VD: TKT-12345"
              className="flex-1 h-9 px-3 border border-[#e8e9e8] rounded-[6px] text-[13px] font-medium outline-none focus:border-[#060606]" 
            />
            <button 
              onClick={handleSearch}
              className="px-3 bg-gray-100 hover:bg-gray-200 border border-[#e8e9e8] rounded-[6px] text-[#060606] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-[4] flex flex-col">
            <label className="block text-[12px] font-semibold text-[#6b6b6b] mb-1">Loại xe</label>
            <input 
              type="text" 
              value={vehicleType} 
              readOnly 
              className="w-full h-9 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#6b6b6b] text-[13px] font-medium cursor-not-allowed outline-none" 
            />
          </div>
          <div className="flex-[6] flex flex-col">
            <label className="block text-[12px] font-semibold text-[#6b6b6b] mb-1">Biển số (Vào)</label>
            <input 
              type="text" 
              value={plateIn} 
              readOnly 
              placeholder="Trống"
              className="w-full h-9 px-3 bg-[#f5f5f4] border border-[#e8e9e8] rounded-[6px] text-[#060606] text-[14px] font-mono font-bold cursor-not-allowed outline-none uppercase" 
            />
          </div>
        </div>

        <div className="mb-4 flex-1">
          <label className="block text-[13px] font-semibold text-[#060606] mb-1.5">Biển số xe ra</label>
          <input 
            type="text" 
            value={plate}
            onChange={(e) => onChangePlate(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            disabled={step === "SEARCH"}
            placeholder="29A-123.45"
            className="w-full h-14 text-[22px] font-mono px-4 border border-[#e8e9e8] rounded-[8px] uppercase font-bold text-[#060606] outline-none focus:border-[#060606] focus:ring-1 focus:ring-[#060606] disabled:opacity-50" 
          />
        </div>
      </div>
      )}

      <div className="flex gap-3 h-[44px] shrink-0 mt-4">
        <button 
          onClick={() => {
            setStep("SEARCH");
            setTicketCode("");
            setPlateIn("");
            onChangePlate("");
          }}
          className="flex-[1] bg-white border border-[#e8e9e8] rounded-[8px] font-medium text-[#6b6b6b] hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button 
          onClick={handleCheckOut}
          disabled={(step === "SEARCH" && !ticketCode) || step === "MISMATCH"}
          className={`flex-[4] font-bold rounded-[8px] transition-all text-[15px] shadow-sm disabled:opacity-50
            ${step === "OPEN" ? "bg-[#1d7a4a] text-white hover:bg-[#155d38]" : step === "MISMATCH" ? "bg-[#ef4444] text-white cursor-not-allowed" : "bg-[#d7ee46] text-[#060606] hover:brightness-95"}`}
        >
          {step === "OPEN" ? "Mở chắn" : step === "MISMATCH" ? "Không khớp" : "Xe ra"}
        </button>
      </div>
    </div>
  );
}
