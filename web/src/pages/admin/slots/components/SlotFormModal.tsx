import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, Plus, Copy, Check } from 'lucide-react';
import { slotService } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';

interface SlotFormModalProps {
  facilityId: string;
  floorId: string;
  vehicleTypes: VehicleType[];
  totalSlots: number;
  currentSlotCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotFormModal({ facilityId, floorId, vehicleTypes, totalSlots, currentSlotCount, onClose, onSuccess }: SlotFormModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState(vehicleTypes[0]?._id ?? '');

  useEffect(() => {
    if (vehicleTypes.length > 0 && !vehicleTypes.some(vt => vt._id === vehicleType)) {
      setVehicleType(vehicleTypes[0]._id);
    }
  }, [vehicleTypes, vehicleType]);

  // Single
  const [code, setCode] = useState('');

  // Bulk
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState<number | string>('');
  const [count, setCount] = useState<number | string>('');

  const remainingSlots = Math.max(0, totalSlots - currentSlotCount);
  const isFull = remainingSlots === 0;

  const handleSubmit = async () => {
    if (!vehicleType) { toast.error('Select a vehicle type'); return; }
    if (isFull) { toast.error(`Tầng đã đạt giới hạn ${totalSlots} slots`); return; }
    if (mode === 'bulk' && Number(count) > remainingSlots) {
      toast.error(`Chỉ còn ${remainingSlots} slot trống. Vui lòng giảm số lượng.`);
      return;
    }
    if (!vehicleType) { toast.error('Select a vehicle type'); return; }
    setLoading(true);
    try {
      if (mode === 'single') {
        if (!code.trim()) { toast.error('Slot code is required'); return; }
        await slotService.create({ facilityId, floorId, vehicleTypeId: vehicleType, code: code.toUpperCase() });
        toast.success(`Slot ${code} created`);
      } else {
        const numStart = Number(startNumber) || 1;
        const numCount = Number(count) || 10;
        const res = await slotService.createBulk({ facilityId, floorId, vehicleType, prefix: prefix || 'A', startNumber: numStart, count: numCount });
        toast.success(`Created ${(res as any).data.length ?? numCount} slots`);
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create slot(s)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 relative"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[#060606]">Create Slots</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Capacity indicator */}
        <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl border mb-1 ${
          isFull
            ? 'bg-red-50 border-red-200 text-red-600'
            : remainingSlots <= 5
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}>
          <span>Sức chứa tầng</span>
          <span className="font-semibold">{currentSlotCount} / {totalSlots} slots {isFull ? '— Đã đầy' : `(còn ${remainingSlots})`}</span>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button onClick={() => setMode('single')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Single Slot</button>
          <button onClick={() => setMode('bulk')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'bulk' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Bulk Create</button>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Vehicle Type <span className="text-red-500">*</span></label>
          {vehicleTypes.length === 0 ? (
            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              Tầng này chưa được cấu hình loại xe cho phép. Vui lòng cấu hình ở phần chỉnh sửa tầng trước.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 p-1">
              {vehicleTypes.map((vt) => {
                const isSelected = vehicleType === vt._id;
                return (
                  <button
                    key={vt._id}
                    type="button"
                    onClick={() => setVehicleType(vt._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#d7ee46] text-[#060606] border-[#c4dc32] scale-[1.03]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{vt.icon || '🚗'}</span>
                    {vt.name}
                    {isSelected && <Check size={13} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {mode === 'single' ? (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Slot Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1, B2"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              Generated pattern: <span className="font-mono font-semibold">{prefix || 'A'}{Number(startNumber) || 1}</span>, <span className="font-mono font-semibold">{prefix || 'A'}{(Number(startNumber) || 1) + 1}</span>, … (<span className="font-semibold">{Number(count) || 10}</span> slots)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Prefix</label>
                <input
                  value={prefix}
                  placeholder="A"
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Start #</label>
                <input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={startNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStartNumber(val === '' ? '' : Number(val));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Count <span className="text-gray-400">(tối đa {remainingSlots})</span></label>
                <input
                  type="number"
                  min={1}
                  max={remainingSlots}
                  placeholder="10"
                  value={count}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCount('');
                    } else {
                      const num = Number(val);
                      setCount(num > remainingSlots ? remainingSlots : num);
                    }
                  }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] ${
                    Number(count) > remainingSlots ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {Number(count) > remainingSlots && (
                  <p className="text-xs text-red-500 mt-1">Vượt quá số slot còn lại ({remainingSlots})</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            disabled={loading || isFull || (mode === 'bulk' && Number(count) > remainingSlots)}
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#060606] text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : (mode === 'single' ? <Plus size={15} /> : <Copy size={15} />)}
            {mode === 'single' ? 'Create Slot' : 'Bulk Create'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
