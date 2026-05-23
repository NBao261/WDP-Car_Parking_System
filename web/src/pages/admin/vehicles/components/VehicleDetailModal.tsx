import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Building2 } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';
import { SLOT_SIZE_LABELS, ICON_MAP } from './constants';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
}

export function VehicleDetailModal({ isOpen, onClose, vehicle }: DetailModalProps) {
  if (!isOpen || !vehicle) return null;

  const { label, color } = SLOT_SIZE_LABELS[vehicle.slotSize] || { label: vehicle.slotSize, color: 'bg-gray-100 text-gray-600 border-gray-200' };

  const facilitiesWithFloors = (vehicle.floors || []).reduce((acc, floor) => {
    if (!floor.facilityId) return acc;
    const isObj = typeof floor.facilityId === 'object';
    const id = isObj ? (floor.facilityId as any)._id : floor.facilityId as string;
    const name = isObj ? (floor.facilityId as any).name : 'Tòa nhà ' + id;

    if (!acc[id]) {
      acc[id] = { id, name, floors: [] };
    }
    acc[id].floors.push({ id: floor._id, name: floor.name });

    return acc;
  }, {} as Record<string, { id: string, name: string, floors: { id: string, name: string }[] }>);

  const groupedFacilities = Object.values(facilitiesWithFloors);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-[#060606]">Vehicle Details</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm text-emerald-600">
                {(() => { const Icon = (vehicle.icon && ICON_MAP[vehicle.icon]) ? ICON_MAP[vehicle.icon] : Car; return <Icon size={32} strokeWidth={1.5} />; })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#060606]">{vehicle.name}</h3>
                <p className="text-sm font-mono text-gray-500 mt-1">{vehicle.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Slot Size</p>
                <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>{label}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-gray-800">{new Date(vehicle.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tòa nhà & Tầng liên kết</p>
              {groupedFacilities.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {groupedFacilities.map(fac => (
                    <div key={fac.id} className="flex flex-col gap-2 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                        <Building2 size={16} />
                        {fac.name}
                      </div>
                      <div className="flex flex-wrap gap-2 pl-5">
                        {fac.floors.map(fl => (
                          <span key={fl.id} className="inline-flex items-center px-2.5 py-1 bg-white text-gray-700 rounded-md text-xs font-semibold border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            {fl.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa liên kết tòa nhà/tầng nào.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mô Tả</p>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 min-h-[80px]">
                {vehicle.description || <span className="text-gray-400 italic">Không có mô tả</span>}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
