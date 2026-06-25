import { X, Loader2 } from "lucide-react";
import { ExceptionData } from "./ExceptionsList";
import { useExceptionDetailLogic } from "./useExceptionDetailLogic";
import { ExceptionInfoBlocks } from "./ExceptionDetailInfoBlocks";
import { ExceptionDetailResolveForm } from "./ExceptionDetailResolveForm";
import { ExceptionDetailReviewBlocks } from "./ExceptionDetailReviewBlocks";

interface ExceptionDetailDrawerProps {
  selectedException: ExceptionData | null;
  onClose: () => void;
  onContinueCheckout: (plate: string) => void;
  onResolved?: () => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RESOLVED: {
    bg: 'bg-[#9FE870]/10',
    text: 'text-[#2d6a1f]',
    border: 'border-[#9FE870]/50',
    label: 'ĐÃ XỬ LÝ',
  },
  REJECTED: {
    bg: 'bg-[#fee2e2]',
    text: 'text-[#991b1b]',
    border: 'border-[#fca5a5]/60',
    label: 'TỪ CHỐI',
  },
  NEW: {
    bg: 'bg-[#fef3c7]',
    text: 'text-[#92400e]',
    border: 'border-[#fcd34d]/60',
    label: 'CHỜ XỬ LÝ',
  },
  PROCESSING: {
    bg: 'bg-[#dbeafe]',
    text: 'text-[#1e40af]',
    border: 'border-[#93c5fd]/60',
    label: 'ĐANG XỬ LÝ',
  },
};

export default function ExceptionDetailDrawer({ selectedException, onClose, onContinueCheckout: _onContinueCheckout, onResolved }: ExceptionDetailDrawerProps) {
  const logic = useExceptionDetailLogic({ selectedException, onClose, onResolved });

  if (!selectedException) return null;

  const badge = STATUS_BADGE[selectedException.status] || STATUS_BADGE.NEW;
  const isResolved = selectedException.status === "RESOLVED";
  const canResolve = selectedException.status === "NEW" || selectedException.status === "PROCESSING";
  const parkingLocation = `${selectedException.facilityName} - ${selectedException.floorName} - ${selectedException.slotCode}`;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-[450px] w-full bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.12)] border-l border-[#e8e9e8] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        <div className="px-6 py-6 border-b border-[#e8e9e8] flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-bold text-[#060606]">Chi tiết Sự cố</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-[13px] text-[#6b6b6b] font-mono">{selectedException.code}</p>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.bg} ${badge.text} ${badge.border}`}>{badge.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-black p-1 rounded-md hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-[#fdfdfd]">
          <ExceptionInfoBlocks selectedException={selectedException} parkingLocation={parkingLocation} />
          
          <ExceptionDetailResolveForm 
            selectedException={selectedException} canResolve={canResolve}
            staffNote={logic.staffNote} setStaffNote={logic.setStaffNote}
            newLicensePlate={logic.newLicensePlate} setNewLicensePlate={logic.setNewLicensePlate}
            selectedFloorId={logic.selectedFloorId} setSelectedFloorId={logic.setSelectedFloorId}
            newSlotId={logic.newSlotId} setNewSlotId={logic.setNewSlotId}
            floors={logic.floors} availableSlots={logic.availableSlots}
            isLoadingFloors={logic.isLoadingFloors} isLoadingSlots={logic.isLoadingSlots}
          />

          <ExceptionDetailReviewBlocks selectedException={selectedException} isResolved={isResolved} />
        </div>

        <div className="p-6 border-t border-[#e8e9e8] flex gap-3 bg-white">
          <button onClick={onClose} disabled={logic.isResolving} className={`${canResolve ? 'flex-1' : 'w-full'} h-11 border border-[#e8e9e8] bg-white rounded-[8px] text-[#060606] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50`}>
            Đóng
          </button>
          {canResolve && (
            <button onClick={logic.handleResolve} disabled={logic.isResolving} className="flex-[2] h-11 bg-[#1a1a1a] text-[#9FE870] font-bold rounded-[8px] hover:bg-black transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {logic.isResolving && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu Xử Lý
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
