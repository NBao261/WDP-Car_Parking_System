import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, AlertTriangle, Trash2, MapPin, Hash, Layers, CarFront, Car } from 'lucide-react';
import { slotService, type ParkingSlot, type SlotStatus } from '../../../../services/slot.service';
import { facilityService } from '../../../../services/facility.service';
import { floorService } from '../../../../services/floor.service';
import { SlotStatusBadge } from '../../../../components/ui/SlotStatusBadge';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { ICON_MAP } from '../../vehicles/components/constants';

interface SlotStatusModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ALL_STATUSES: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance', 'locked'];

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
  locked: 'Khóa',
};

export function SlotStatusModal({ slot, onClose, onSuccess }: SlotStatusModalProps) {
  const [selected, setSelected] = useState<SlotStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [facilityName, setFacilityName] = useState<string>('');
  const [floorName, setFloorName] = useState<string>('');
  const [fetchingNames, setFetchingNames] = useState(false);

  useEffect(() => { 
    setSelected(''); 
    setFacilityName('');
    setFloorName('');
    
    if (!slot) return;
    const fetchNames = async () => {
      setFetchingNames(true);
      try {
        const facIdStr = typeof slot.facilityId === 'object' ? (slot.facilityId as any)._id : slot.facilityId;
        const floorIdStr = typeof slot.floorId === 'object' ? (slot.floorId as any)._id : slot.floorId;

        if (typeof slot.facilityId === 'object' && (slot.facilityId as any).name) {
          setFacilityName((slot.facilityId as any).name);
        } else if (facIdStr) {
          const res = await facilityService.getById(facIdStr);
          if (res.success) setFacilityName(res.data.name);
        }

        if (typeof slot.floorId === 'object' && (slot.floorId as any).name) {
          setFloorName((slot.floorId as any).name);
        } else if (floorIdStr) {
          const res = await floorService.getById(floorIdStr);
          if (res.success) setFloorName(res.data.name);
        }
      } catch (err) {
        console.error('Failed to fetch facility/floor names', err);
      } finally {
        setFetchingNames(false);
      }
    };
    fetchNames();
  }, [slot]);

  if (!slot) return null;
  const nexts = ALL_STATUSES.filter(s => s !== slot.status);
  const canDelete = slot.status === 'available';

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await slotService.updateStatus(slot._id, { status: selected });
      toast.success(`Đã cập nhật trạng thái slot ${slot.code} thành ${STATUS_LABELS[selected]}`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await slotService.delete(slot._id);
      toast.success('Xóa slot thành công');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Xóa slot thất bại');
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  let VtIcon = Car;
  let vtNameStr = 'N/A';

  if (slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object') {
    const vt = slot.vehicleTypeId as any;
    vtNameStr = vt.name || 'N/A';
    if (vt.icon && ICON_MAP[vt.icon]) {
      VtIcon = ICON_MAP[vt.icon];
    }
  } else if (slot.vehicleTypeId) {
    vtNameStr = slot.vehicleTypeId as string;
  }

  const floorIdStr = typeof slot.floorId === 'object' ? (slot.floorId as any)._id : slot.floorId;
  const facIdStr = typeof slot.facilityId === 'object' ? (slot.facilityId as any)._id : slot.facilityId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#060606]">Chi Tiết Slot</h2>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý và cập nhật thông tin vị trí đỗ xe</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Detailed Info Card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <span className="font-bold text-gray-900 text-lg">{slot.code}</span>
              </div>
              <SlotStatusBadge status={slot.status} variant="full" />
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin size={12}/> Cơ Sở</p>
                {fetchingNames ? (
                  <div className="h-5 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate" title={facilityName}>{facilityName || 'N/A'}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Layers size={12}/> Tầng</p>
                {fetchingNames ? (
                  <div className="h-5 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate" title={floorName}>{floorName || 'N/A'}</span>
                  </div>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CarFront size={12}/> Loại Xe</p>
                <div className="flex items-center gap-2 text-gray-800">
                  {slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object' && (
                    <VtIcon size={16} className="text-indigo-500" />
                  )}
                  <span className="text-sm font-semibold">{vtNameStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Change */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Đổi trạng thái thành</p>
            {nexts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <AlertTriangle size={16} className="text-orange-500 shrink-0" />
                Không có trạng thái nào khác khả dụng.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {nexts.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelected(s)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      selected === s
                        ? 'bg-[#d7ee46] text-[#060606] border-[#c4dc32] shadow-sm scale-[1.02]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
            
            <button
              disabled={!selected || loading}
              onClick={handleSubmit}
              className="w-full mt-4 py-3 bg-[#d7ee46] text-[#060606] rounded-xl text-sm font-bold border border-[#c4dc32] hover:bg-[#c4dc32] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Cập Nhật Trạng Thái
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-5 border-t border-gray-100">
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting || loading || !canDelete}
              className="w-full py-3 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Xóa Slot Khỏi Hệ Thống
            </button>
            {!canDelete && <p className="text-[11px] text-red-500 mt-2 text-center font-medium">Chỉ có thể xóa slot khi đang ở trạng thái Trống</p>}
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa Slot"
        message={`Bạn có chắc chắn muốn xóa slot "${slot.code}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
