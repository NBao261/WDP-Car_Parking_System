import { useState, useEffect } from "react";
import { toast } from "sonner";
import { exceptionService, ExceptionType } from "../../../../services/exception.service";
import { floorService } from "../../../../services/floor.service";
import { slotService, ParkingSlot } from "../../../../services/slot.service";

export function useExceptionDetailLogic({ selectedException, onClose, onResolved }: any) {
  const [staffNote, setStaffNote] = useState("");
  const [newLicensePlate, setNewLicensePlate] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [newSlotId, setNewSlotId] = useState("");
  const [floors, setFloors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (selectedException) {
      setStaffNote(""); setNewLicensePlate(""); setNewSlotId(""); setSelectedFloorId("");
      setFloors([]); setAvailableSlots([]);
      if ((selectedException.status === "NEW" || selectedException.status === "PROCESSING") && selectedException.typeEnum === ExceptionType.WRONG_ZONE && selectedException.facilityId) {
        fetchFloors(selectedException.facilityId);
      }
    }
  }, [selectedException]);

  useEffect(() => {
    if (selectedFloorId && selectedException) fetchSlots(selectedFloorId, selectedException.vehicleTypeIdStr);
    else setAvailableSlots([]);
  }, [selectedFloorId]);

  const fetchFloors = async (facilityId: string) => {
    setIsLoadingFloors(true);
    try {
      const res = await floorService.getAll({ facilityId, limit: 100 });
      if (res.success) setFloors(res.data);
    } catch { toast.error("Không thể tải danh sách tầng"); }
    finally { setIsLoadingFloors(false); }
  };

  const fetchSlots = async (floorId: string, vehicleTypeId: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await slotService.getByFloor(floorId);
      if (res.success) {
        setAvailableSlots(res.data.filter(s => (s.status === "available" || s.status === "locked") && (typeof s.vehicleTypeId === "string" ? s.vehicleTypeId : s.vehicleTypeId._id) === vehicleTypeId));
      }
    } catch { toast.error("Không thể tải danh sách vị trí đỗ"); }
    finally { setIsLoadingSlots(false); }
  };

  const handleResolve = async () => {
    if (!selectedException) return;
    if (selectedException.typeEnum === ExceptionType.WRONG_PLATE && !newLicensePlate.trim()) { toast.error("Vui lòng nhập Biển số đúng!"); return; }
    if (selectedException.typeEnum === ExceptionType.WRONG_ZONE && !newSlotId) { toast.error("Vui lòng chọn Vị trí đỗ mới!"); return; }
    if (!staffNote.trim()) { toast.error("Vui lòng nhập Ghi chú xử lý!"); return; }

    setIsResolving(true);
    try {
      const payload: any = { staffNote: staffNote.trim() };
      if (selectedException.typeEnum === ExceptionType.WRONG_PLATE) payload.newLicensePlate = newLicensePlate.toUpperCase().trim();
      if (selectedException.typeEnum === ExceptionType.WRONG_ZONE) payload.newSlotId = newSlotId;
      await exceptionService.resolveException(selectedException.id, payload);
      toast.success("Đã xử lý sự cố thành công!");
      if (onResolved) onResolved();
    } catch (error: any) { toast.error(error.message || "Lỗi khi xử lý sự cố!"); }
    finally { setIsResolving(false); }
  };

  return {
    staffNote, setStaffNote, newLicensePlate, setNewLicensePlate, selectedFloorId, setSelectedFloorId,
    newSlotId, setNewSlotId, floors, availableSlots, isLoadingFloors, isLoadingSlots, isResolving, handleResolve
  };
}
