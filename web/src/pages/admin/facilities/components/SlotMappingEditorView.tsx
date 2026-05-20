import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, GripHorizontal, Map } from 'lucide-react';
import { Floor } from '../../../../services/floor.service';
import { ParkingSlot, SlotStatus } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { SlotStatusModal } from '../../slots/components/SlotStatusModal';
import { SlotFormModal } from '../../slots/components/SlotFormModal';

interface SlotMappingEditorViewProps {
  floor: Floor | null;
  slots: ParkingSlot[];
  vtMap: Record<string, string>;
  vehicleTypes: VehicleType[];
  loading: boolean;
  onRefreshSlots: () => void;
}

export function SlotMappingEditorView({
  floor, slots, vtMap, vehicleTypes, loading, onRefreshSlots,
}: SlotMappingEditorViewProps) {
  const [filterStatus, setFilterStatus] = useState<SlotStatus | 'all'>('all');
  const [statusSlot, setStatusSlot]     = useState<ParkingSlot | null>(null);
  const [bulkOpen, setBulkOpen]         = useState(false);

  if (!floor) return null;

  const filteredSlots = filterStatus === 'all'
    ? slots
    : slots.filter(s => s.status === filterStatus);

  const filterButtons: { label: string; value: SlotStatus | 'all' }[] = [
    { label: 'Tất cả',      value: 'all' },
    { label: 'Trống',       value: 'available' },
    { label: 'Đang dùng',   value: 'occupied' },
    { label: 'Đã đặt',      value: 'reserved' },
    { label: 'Bảo trì',     value: 'maintenance' },
    { label: 'Khóa',        value: 'locked' },
  ];

  // Allowed vehicle types for this floor
  const floorVehicleTypes = vehicleTypes.filter(vt =>
    (floor.allowedVehicleTypes || []).some((allowed: any) =>
      (typeof allowed === 'string' ? allowed : allowed._id) === vt._id
    )
  );

  return (
    <>
      <motion.div
        id="slot-editor"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-[#e8eae8] p-6 mt-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#060606]">
              Sơ đồ Slot — {floor.name}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Nhấp vào một slot để thay đổi trạng thái</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshSlots}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              title="Làm mới"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setBulkOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
              style={{ background: '#d7ee46', color: '#1a1a0a' }}
            >
              <Plus size={16} /> Tạo Slot
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === btn.value
                  ? 'bg-[#d7ee46] text-[#060606] font-semibold'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Body: palette + canvas */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Vehicle types palette */}
          <div className="w-full lg:w-44 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2.5 shrink-0">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Loại xe</h4>
            {floorVehicleTypes.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Chưa gán loại xe</p>
            ) : floorVehicleTypes.map(vt => (
              <div
                key={vt._id}
                className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-gray-700 hover:shadow-sm transition-shadow"
              >
                <GripHorizontal size={13} className="opacity-40" />
                <span>{vt.icon}</span>
                <span className="truncate">{vt.name}</span>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-5 min-h-[260px] overflow-x-auto">
            {loading ? (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
                <Map size={28} className="opacity-30" />
                {slots.length === 0 ? 'Tầng này chưa có slot nào.' : 'Không có slot phù hợp bộ lọc.'}
              </div>
            ) : (
              <div className="min-w-[500px]">
                {/* Legend */}
                <div className="flex gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-green-100 border border-green-300" /> Đang dùng</div>
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-200" /> Đã đặt</div>
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-red-50 border border-red-200" /> Bảo trì / Khóa</div>
                </div>
                {/* Slot grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {filteredSlots.map(slot => {
                    let bgClass = 'bg-white border-gray-200 text-gray-500';
                    if (slot.status === 'occupied')                            bgClass = 'bg-green-100 border-green-300 text-green-700';
                    else if (slot.status === 'reserved')                       bgClass = 'bg-blue-100 border-blue-200 text-blue-700';
                    else if (slot.status === 'maintenance' || slot.status === 'locked') bgClass = 'bg-red-50 border-red-200 text-red-600';
                    const vtName = (slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object')
                      ? slot.vehicleTypeId.name
                      : (slot.vehicleTypeId ? (vtMap[slot.vehicleTypeId] ?? '') : '');
                    return (
                      <div
                        key={slot._id}
                        onClick={() => setStatusSlot(slot)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md shadow-sm border ${bgClass}`}
                        title={`${slot.code} – ${vtName} (${slot.status})`}
                      >
                        {slot.code}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {statusSlot && (
          <SlotStatusModal
            slot={statusSlot}
            onClose={() => setStatusSlot(null)}
            onSuccess={() => { setStatusSlot(null); onRefreshSlots(); }}
          />
        )}
        {bulkOpen && floor && (
          <SlotFormModal
            facilityId={(floor as any).facilityId}
            floorId={floor._id}
            vehicleTypes={floorVehicleTypes}
            totalSlots={floor.totalSlots}
            currentSlotCount={slots.length}
            onClose={() => setBulkOpen(false)}
            onSuccess={() => { setBulkOpen(false); onRefreshSlots(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
