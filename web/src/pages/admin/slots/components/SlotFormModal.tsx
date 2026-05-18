import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, Plus, Copy } from 'lucide-react';
import { slotService } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';

interface SlotFormModalProps {
  facilityId: string;
  floorId: string;
  vehicleTypes: VehicleType[];
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotFormModal({ facilityId, floorId, vehicleTypes, onClose, onSuccess }: SlotFormModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState(vehicleTypes[0]?._id ?? '');

  // Single
  const [code, setCode] = useState('');

  // Bulk
  const [prefix, setPrefix] = useState('A');
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(10);

  const handleSubmit = async () => {
    if (!vehicleType) { toast.error('Select a vehicle type'); return; }
    setLoading(true);
    try {
      if (mode === 'single') {
        if (!code.trim()) { toast.error('Slot code is required'); return; }
        await slotService.create({ facilityId, floorId, vehicleTypeId: vehicleType, code: code.toUpperCase() });
        toast.success(`Slot ${code} created`);
      } else {
        const res = await slotService.createBulk({ facilityId, floorId, vehicleType, prefix, startNumber, count });
        toast.success(`Created ${(res as any).data.length ?? count} slots`);
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

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button onClick={() => setMode('single')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Single Slot</button>
          <button onClick={() => setMode('bulk')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'bulk' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Bulk Create</button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] bg-white"
          >
            {vehicleTypes.map((vt) => (
              <option key={vt._id} value={vt._id}>{vt.icon} {vt.name}</option>
            ))}
          </select>
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
              Generated pattern: <span className="font-mono font-semibold">{prefix}{startNumber}</span>, <span className="font-mono font-semibold">{prefix}{startNumber + 1}</span>, … (<span className="font-semibold">{count}</span> slots)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Prefix</label>
                <input
                  value={prefix}
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
                  value={startNumber}
                  onChange={(e) => setStartNumber(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Count</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#060606] text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : (mode === 'single' ? <Plus size={15} /> : <Copy size={15} />)}
            {mode === 'single' ? 'Create Slot' : 'Bulk Create'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
