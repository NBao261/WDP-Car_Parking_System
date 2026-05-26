import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useState } from "react";

export default function ShiftSelectionPage() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState("Topaz 2");
  const [gate, setGate] = useState("Gate 1 (Basement 1)");

  // Giả lập dữ liệu đọc từ hệ thống quản lý
  const buildings = ["Topaz 2", "Topaz 1", "Ruby 3"];
  const gates = ["Gate 1 (Basement 1)", "Gate 2 (Basement 2)"];

  const handleStartShift = () => {
    sessionStorage.setItem("staff_building", building);
    sessionStorage.setItem("staff_gate", gate);
    navigate("/staff");
  };

  return (
    <div className="min-h-screen bg-[#eff0ef] flex items-center justify-center font-sans text-[#060606] relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="bg-white p-9 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] w-full max-w-[480px] z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-[#d7ee46] rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-[#060606]" />
          </div>
          <h1 className="text-[20px] font-bold">Select Your Current Shift</h1>
          <p className="text-[13px] text-[#6b6b6b] mt-1 text-center">
            This will define your gate assignment for this session.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#e8e9e8]">
          <div>
            <label className="block text-sm font-medium mb-1.5">Building</label>
            <select 
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full h-11 px-3 border border-[#e8e9e8] rounded-[8px] focus:outline-none focus:border-[#060606] transition-colors appearance-none bg-white"
            >
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">Floor / Basement</label>
            <select 
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              className="w-full h-11 px-3 border border-[#e8e9e8] rounded-[8px] focus:outline-none focus:border-[#060606] transition-colors appearance-none bg-white"
            >
              {gates.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-8 mt-4">
          <button 
            onClick={() => navigate("/login")}
            className="flex-1 h-11 border border-[#e8e9e8] rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleStartShift}
            className="flex-1 h-11 bg-[#1a1a1a] text-[#d7ee46] font-medium rounded-[8px] hover:bg-black transition-colors"
          >
            Start Shift →
          </button>
        </div>
      </div>
    </div>
  );
}
