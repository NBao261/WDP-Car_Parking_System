import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { slotService, type ParkingSlot, type SlotStatus } from '../../../../services/slot.service';
import { SlotStatusBadge } from '../../../../components/ui/SlotStatusBadge';

interface SlotStatusModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onSuccess: () => void;
}

// All logical statuses for manual adjustment
const ALL_STATUSES: SlotStatus[] = ['available', 'occupied', 'reserved', 'maintenance', 'locked'];

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  locked: 'Locked',
};

export function SlotStatusModal({ slot, onClose, onSuccess }: SlotStatusModalProps) {
  const [selected, setSelected] = useState<SlotStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setSelected(''); }, [slot]);

  if (!slot) return null;
  const nexts = ALL_STATUSES.filter(s => s !== slot.status);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await slotService.updateStatus(slot._id, { status: selected });
      toast.success(`Slot ${slot.code} status updated to ${STATUS_LABELS[selected]}`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete slot "${slot.code}"?`)) return;
    setIsDeleting(true);
    try {
      await slotService.delete(slot._id);
      toast.success('Slot deleted successfully');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete slot');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#060606]">Manage Slot</h2>
            <p className="text-sm text-gray-500">Slot Code: <span className="font-semibold">{slot.code}</span></p>
            <p className="text-sm text-gray-500">Vehicle Type: <span className="font-semibold">
              {(slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object') ? `${slot.vehicleTypeId.icon ?? ''} ${slot.vehicleTypeId.name ?? ''}` : (slot.vehicleTypeId ?? '')}
            </span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Current Status</p>
          <SlotStatusBadge status={slot.status} variant="full" />
        </div>

        {nexts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
            No alternative statuses available.
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Change Status To</p>
            <div className="flex flex-wrap gap-2">
              {nexts.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selected === s
                      ? 'bg-[#d7ee46] text-[#060606] border-[#d7ee46]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            
            <button
              disabled={!selected || loading}
              onClick={handleSubmit}
              className="w-full mt-4 py-2.5 bg-[#d7ee46] text-[#060606] rounded-xl text-sm font-medium hover:bg-[#c5db3d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              Update Status
            </button>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-red-600 mb-2">Danger Zone</p>
          <button
            onClick={handleDelete}
            disabled={isDeleting || loading || nexts.length === 0}
            className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete Slot
          </button>
          {nexts.length === 0 && <p className="text-xs text-red-400 mt-1 text-center">Cannot delete while slot is in use</p>}
        </div>
      </motion.div>
    </div>
  );
}
