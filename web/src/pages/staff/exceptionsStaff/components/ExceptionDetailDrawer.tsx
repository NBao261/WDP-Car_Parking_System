import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExceptionData } from "./ExceptionsList";
import { exceptionService, ExceptionType } from "../../../../services/exception.service";
import { floorService } from "../../../../services/floor.service";
import { slotService, ParkingSlot } from "../../../../services/slot.service";

interface ExceptionDetailDrawerProps {
  selectedException: ExceptionData | null;
  onClose: () => void;
  onContinueCheckout: (plate: string) => void;
  onResolved?: () => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RESOLVED:   { bg: "bg-[#e8f7f0]",  text: "text-[#1d7a4a]", border: "border-[#e8f7f0]",  label: "ĐÃ XỬ LÝ" },
  REJECTED:   { bg: "bg-[#fde8e8]",  text: "text-[#b03030]", border: "border-[#fde8e8]",  label: "TỪ CHỐI" },
  NEW:        { bg: "bg-[#fff3e0]",  text: "text-[#c77700]", border: "border-[#fff3e0]",  label: "CHỜ XỬ LÝ" },
  PROCESSING: { bg: "bg-[#e3ecf8]",  text: "text-[#1a5fa8]", border: "border-[#e3ecf8]",  label: "ĐANG XỬ LÝ" },
};

export default function ExceptionDetailDrawer({
  selectedException,
  onClose,
  onContinueCheckout,
  onResolved,
}: ExceptionDetailDrawerProps) {
  const [staffNote, setStaffNote] = useState("");
  const [newLicensePlate, setNewLicensePlate] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [newSlotId, setNewSlotId] = useState("");
  
  const [floors, setFloors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Reset form when exception changes
  useEffect(() => {
    if (selectedException) {
      setStaffNote("");
      setNewLicensePlate("");
      setNewSlotId("");
      setSelectedFloorId("");
      setFloors([]);
      setAvailableSlots([]);

      // Fetch floors if it's a WRONG_ZONE exception
      if (
        (selectedException.status === "NEW" || selectedException.status === "PROCESSING") &&
        selectedException.typeEnum === ExceptionType.WRONG_ZONE &&
        selectedException.facilityId
      ) {
        fetchFloors(selectedException.facilityId);
      }
    }
  }, [selectedException]);

  // Fetch slots when floor changes
  useEffect(() => {
    if (selectedFloorId && selectedException) {
      fetchSlots(selectedFloorId, selectedException.vehicleTypeIdStr);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedFloorId]);

  const fetchFloors = async (facilityId: string) => {
    setIsLoadingFloors(true);
    try {
      const res = await floorService.getAll({ facilityId, limit: 100 });
      if (res.success) {
        setFloors(res.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách tầng");
    } finally {
      setIsLoadingFloors(false);
    }
  };

  const fetchSlots = async (floorId: string, vehicleTypeId: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await slotService.getByFloor(floorId);
      if (res.success) {
        // Lọc các slot khả dụng (available hoặc locked) VÀ đúng loại xe
        const validSlots = res.data.filter(
          (s) => 
            (s.status === "available" || s.status === "locked") &&
            (typeof s.vehicleTypeId === "string" ? s.vehicleTypeId : s.vehicleTypeId._id) === vehicleTypeId
        );
        setAvailableSlots(validSlots);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách vị trí đỗ");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedException) return;

    if (selectedException.typeEnum === ExceptionType.WRONG_PLATE && !newLicensePlate.trim()) {
      toast.error("Vui lòng nhập Biển số đúng!");
      return;
    }
    if (selectedException.typeEnum === ExceptionType.WRONG_ZONE && !newSlotId) {
      toast.error("Vui lòng chọn Vị trí đỗ mới!");
      return;
    }
    if (!staffNote.trim()) {
      toast.error("Vui lòng nhập Ghi chú xử lý!");
      return;
    }

    setIsResolving(true);
    try {
      const payload: any = { staffNote: staffNote.trim() };
      if (selectedException.typeEnum === ExceptionType.WRONG_PLATE) {
        payload.newLicensePlate = newLicensePlate.toUpperCase().trim();
      }
      if (selectedException.typeEnum === ExceptionType.WRONG_ZONE) {
        payload.newSlotId = newSlotId;
      }

      await exceptionService.resolveException(selectedException.id, payload);
      toast.success("Đã xử lý ngoại lệ thành công!");
      if (onResolved) onResolved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xử lý ngoại lệ!");
    } finally {
      setIsResolving(false);
    }
  };

  if (!selectedException) return null;

  const badge = STATUS_BADGE[selectedException.status] || STATUS_BADGE.NEW;
  const isResolved = selectedException.status === "RESOLVED";
  const canResolve = selectedException.status === "NEW" || selectedException.status === "PROCESSING";

  // Vị trí đỗ
  const parkingLocation = `${selectedException.facilityName} - ${selectedException.floorName} - ${selectedException.slotCode}`;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-[450px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#e8e9e8] flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-bold text-[#060606]">Chi tiết Ngoại lệ</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-[13px] text-[#6b6b6b] font-mono">
                {selectedException.code}
              </p>
              <span
                className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
              >
                {badge.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#fdfdfd]">
          {/* BLOCK 1: THÔNG TIN XE VÀ LƯỢT GỬI */}
          <div>
            <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#060606] rounded-sm"></span>
              Thông tin xe và lượt gửi
            </h4>
            <div className="bg-white border border-[#e8e9e8] rounded-[10px] p-4 space-y-3 shadow-sm">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Biển số:</span>
                <span className="font-mono font-bold text-[14px] text-[#060606]">{selectedException.plate}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Loại xe:</span>
                <span className="font-medium text-[#060606]">{selectedException.vehicleType}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Mã thẻ:</span>
                <span className="font-mono font-medium text-[#060606]">{selectedException.cardCode}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Giờ vào bãi:</span>
                <span className="font-medium text-[#060606]">{selectedException.checkInTime}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Vị trí đỗ hiện tại:</span>
                <span className="font-medium text-[#060606]">{parkingLocation}</span>
              </div>
            </div>
          </div>

          {/* BLOCK 2: THÔNG TIN NGOẠI LỆ */}
          <div>
            <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e74c3c] rounded-sm"></span>
              Thông tin ngoại lệ
            </h4>
            <div className="bg-white border border-[#e8e9e8] rounded-[10px] p-4 space-y-3 shadow-sm">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Loại sự cố:</span>
                <span className="font-medium text-[#060606]">{selectedException.type}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Thời gian ghi nhận:</span>
                <span className="font-medium text-[#060606]">{selectedException.time}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Người báo cáo:</span>
                <span className="font-medium text-[#060606]">{selectedException.staffName}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Phụ phí yêu cầu:</span>
                <span className="font-bold text-[#b03030]">
                  {selectedException.surcharge > 0 
                    ? `${selectedException.surcharge.toLocaleString("vi-VN")} VNĐ` 
                    : "0 VNĐ"}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#e8e9e8]">
                <span className="text-[12px] text-[#6b6b6b] block mb-1">Mô tả chi tiết từ người báo cáo:</span>
                <p className="text-[13px] text-[#060606] leading-relaxed">
                  {selectedException.description || "Không có mô tả chi tiết."}
                </p>
              </div>
            </div>
          </div>

          {/* BLOCK 3: FORM XỬ LÝ (Nếu đang chờ xử lý) */}
          {canResolve && (
            <div>
              <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#f39c12] rounded-sm"></span>
                Thực hiện Xử lý Ngoại lệ
              </h4>
              <div className="bg-[#fffdf5] border border-[#fdeab1] rounded-[10px] p-4 space-y-4 shadow-sm animate-in fade-in">
                
                {/* Dành cho Sai Biển Số */}
                {selectedException.typeEnum === ExceptionType.WRONG_PLATE && (
                  <div>
                    <label className="block text-[13px] font-medium text-[#060606] mb-1.5">
                      Biển số đúng (Hệ thống sẽ cập nhật lại vé) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newLicensePlate}
                      onChange={(e) => setNewLicensePlate(e.target.value.toUpperCase())}
                      placeholder="Nhập biển số đúng..."
                      className="w-full bg-white border border-[#fdeab1] rounded-[8px] px-3 h-10 text-[13px] font-mono focus:outline-none focus:border-[#f39c12]"
                    />
                  </div>
                )}

                {/* Dành cho Sai Khu Vực Đỗ */}
                {selectedException.typeEnum === ExceptionType.WRONG_ZONE && (
                  <div className="space-y-3">
                    <p className="text-[12px] text-[#c77700] mb-2 leading-relaxed">
                      Lưu ý: Hệ thống chỉ hiển thị các Vị trí đang Trống hoặc đang bị Khoá, và phải đúng loại xe ({selectedException.vehicleType}).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13px] font-medium text-[#060606] mb-1.5">
                          Chọn Tầng
                        </label>
                        <select
                          value={selectedFloorId}
                          onChange={(e) => {
                            setSelectedFloorId(e.target.value);
                            setNewSlotId("");
                          }}
                          className="w-full bg-white border border-[#fdeab1] rounded-[8px] px-3 h-10 text-[13px] focus:outline-none focus:border-[#f39c12]"
                          disabled={isLoadingFloors}
                        >
                          <option value="">-- Chọn tầng --</option>
                          {floors.map(f => (
                            <option key={f._id} value={f._id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-[#060606] mb-1.5">
                          Vị trí đỗ mới <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newSlotId}
                          onChange={(e) => setNewSlotId(e.target.value)}
                          className="w-full bg-white border border-[#fdeab1] rounded-[8px] px-3 h-10 text-[13px] focus:outline-none focus:border-[#f39c12]"
                          disabled={!selectedFloorId || isLoadingSlots}
                        >
                          <option value="">-- Chọn vị trí --</option>
                          {availableSlots.map(s => (
                            <option key={s._id} value={s._id}>{s.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-[#060606] mb-1.5">
                    Ghi chú xử lý của bạn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Nhập ghi chú xử lý (VD: Đã cập nhật lại biển số đúng cho khách)..."
                    className="w-full bg-white border border-[#fdeab1] rounded-[8px] p-3 text-[13px] focus:outline-none focus:border-[#f39c12] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 4: THÔNG TIN ĐÃ XỬ LÝ (Chỉ hiện khi đã xử lý xong) */}
          {isResolved && (
            <div>
              <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#2ecc71] rounded-sm"></span>
                Thông tin xử lý
              </h4>
              <div className="bg-white border border-[#e8e9e8] rounded-[10px] p-4 space-y-3 shadow-sm">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Người xử lý:</span>
                  <span className="font-medium text-[#060606]">{selectedException.resolvedByStaffName || "Hệ thống"}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6b6b6b]">Thời gian xử lý:</span>
                  <span className="font-medium text-[#060606]">{selectedException.updatedAt}</span>
                </div>
                {selectedException.staffNote && (
                  <div className="mt-3 pt-3 border-t border-[#e8e9e8]">
                    <span className="text-[12px] text-[#6b6b6b] block mb-1">Ghi chú của Staff:</span>
                    <p className="text-[13px] text-[#060606] italic bg-gray-50 p-2 rounded border border-gray-100">
                      "{selectedException.staffNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCK 5: KHU VỰC QUẢN LÝ (Chỉ hiện nếu có managerNote) */}
          {selectedException.managerNote && (
            <div>
              <h4 className="text-[12px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#3498db] rounded-sm"></span>
                Review từ Quản lý
              </h4>
              <div className="bg-[#f0f7fb] border border-[#bce0fd] rounded-[10px] p-4 shadow-sm">
                <div className="flex justify-between text-[13px] mb-2">
                  <span className="text-[#1a5fa8] font-medium">Quản lý ghi chú:</span>
                  {selectedException.managerName && (
                    <span className="text-[#6b6b6b] text-[12px]">{selectedException.managerName}</span>
                  )}
                </div>
                <p className="text-[13px] text-[#060606] leading-relaxed">
                  {selectedException.managerNote}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-white">
          <button
            onClick={onClose}
            disabled={isResolving}
            className={`${canResolve ? 'flex-1' : 'w-full'} h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50`}
          >
            Đóng
          </button>
          {canResolve && (
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="flex-[2] h-11 bg-[#f39c12] text-white font-bold rounded-[8px] hover:bg-[#d68910] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isResolving && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu Xử Lý
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
