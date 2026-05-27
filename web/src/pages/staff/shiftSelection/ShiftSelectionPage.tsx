import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../../store";

export default function ShiftSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const assignedFacilities = (user?.assignedFacilities || []) as any[];

  const [selectedFacilityId, setSelectedFacilityId] = useState(
    assignedFacilities.length > 0 ? assignedFacilities[0]._id : ""
  );

  const handleStartShift = () => {
    if (!selectedFacilityId) return;

    const facility = assignedFacilities.find(
      (f: any) => f._id === selectedFacilityId
    );
    const facilityName = facility?.name || "";

    sessionStorage.setItem("staff_facility_id", selectedFacilityId);
    sessionStorage.setItem("staff_facility_name", facilityName);
    // Tự động sinh gate name dựa trên tên toà nhà — nhất quán, không cần staff nhập tay
    sessionStorage.setItem("staff_gate_name", `Cổng - ${facilityName}`);

    navigate("/staff");
  };

  return (
    <div className="min-h-screen bg-[#eff0ef] flex items-center justify-center font-sans text-[#060606] relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="bg-white p-9 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] w-full max-w-[420px] z-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-[#d7ee46] rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-[#060606]" />
          </div>
          <h1 className="text-[20px] font-bold">Xác Nhận Vị Trí Làm Việc</h1>
          <p className="text-[13px] text-[#6b6b6b] mt-1 text-center">
            Chọn toà nhà bạn sẽ trực trong ca này rồi bấm Bắt đầu ca.
          </p>
        </div>

        <div className="pt-4 border-t border-[#e8e9e8]">
          {/* Building */}
          <label className="block text-sm font-medium mb-1.5">
            Toà nhà (Building)
          </label>
          <div className="relative">
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full h-11 px-3 pr-8 border border-[#e8e9e8] rounded-[8px] focus:outline-none focus:border-[#060606] transition-colors appearance-none bg-white"
            >
              <option value="" disabled>
                -- Chọn Toà nhà --
              </option>
              {assignedFacilities.map((facility: any) => (
                <option key={facility._id} value={facility._id}>
                  {facility.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ▾
            </span>
          </div>
          {assignedFacilities.length === 0 && (
            <p className="text-[12px] text-red-500 mt-1.5">
              Bạn chưa được phân công tại toà nhà nào. Vui lòng liên hệ Admin.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-8 mt-4">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 h-11 border border-[#e8e9e8] rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleStartShift}
            disabled={!selectedFacilityId}
            className="flex-[2] h-11 bg-[#1a1a1a] text-[#d7ee46] font-medium rounded-[8px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bắt đầu ca →
          </button>
        </div>
      </div>
    </div>
  );
}
