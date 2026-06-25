import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../store";

export function useShiftSelectionLogic() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const assignedFacilities = (user?.assignedFacilities || []) as any[];
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    assignedFacilities.length > 0 ? assignedFacilities[0]._id : ""
  );

  const handleStartShift = () => {
    if (!selectedFacilityId) return;
    const facility = assignedFacilities.find((f: any) => f._id === selectedFacilityId);
    const facilityName = facility?.name || "";
    sessionStorage.setItem("staff_facility_id", selectedFacilityId);
    sessionStorage.setItem("staff_facility_name", facilityName);
    sessionStorage.setItem("staff_gate_name", `Cổng - ${facilityName}`);
    navigate("/staff");
  };

  const handleCancel = () => {
    logout();
    navigate("/login");
  };

  return { assignedFacilities, selectedFacilityId, setSelectedFacilityId, handleStartShift, handleCancel };
}
