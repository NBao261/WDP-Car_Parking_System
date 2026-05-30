import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, GripHorizontal, Map, Car, X } from 'lucide-react';
import { Floor } from '../../../../services/floor.service';
import { ParkingSlot, SlotStatus } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { SlotStatusModal } from './SlotStatusModal';
import { SlotFormModal } from './SlotFormModal';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';

interface SlotMappingEditorViewProps {
  floor: Floor | null;
  slots: ParkingSlot[];
  vtMap: Record<string, string>;
  vehicleTypes: VehicleType[];
  loading: boolean;
  onRefreshSlots: () => void;
  onClose?: () => void;
  isFacilityActive?: boolean;
}

export function SlotMappingEditorView({
  floor, slots, vtMap, vehicleTypes, loading, onRefreshSlots, onClose, isFacilityActive = true
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
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#060606]">
              Sơ đồ vị trí đỗ xe — Tầng {floor.name}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Nhấp vào một slot để thay đổi trạng thái</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
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
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshSlots}
              title="Làm mới"
              className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            {floor.status === 'active' && isFacilityActive && (
              <button
                onClick={() => setBulkOpen(true)}
                className="bg-[#d7ee46] text-[#060606] px-5 py-2 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                <Plus size={18} /> Tạo Slot
              </button>
            )}
          </div>
        </div>

        {/* Body: palette + canvas */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Vehicle types palette */}
          <div className="w-full lg:w-44 bg-gray-50 rounded-xl border border-gray-200 shrink-0 relative min-h-[260px]">
            <div className="absolute inset-0 p-4 flex flex-col">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 shrink-0">Loại xe</h4>
              <div className="overflow-y-auto space-y-2.5 pr-1 vehicle-scrollbar h-full">
                <style>{`
                  .vehicle-scrollbar::-webkit-scrollbar { width: 4px; }
                  .vehicle-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .vehicle-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                  .vehicle-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                `}</style>
                {floorVehicleTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Chưa gán loại xe</p>
                ) : floorVehicleTypes.map(vt => {
                  const Icon = (vt.icon && ICON_MAP[vt.icon]) ? ICON_MAP[vt.icon] : Car;
                  return (
                    <div
                      key={vt._id}
                      className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-gray-700 hover:shadow-sm transition-shadow cursor-grab shrink-0"
                    >
                      <GripHorizontal size={13} className="opacity-40 shrink-0" />
                      <Icon size={16} className="text-gray-500 shrink-0" />
                      <span className="truncate">{vt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 min-w-0 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-5 min-h-[260px] overflow-x-auto">
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
                        onClick={() => {
                          if (floor.status === 'active' && isFacilityActive) setStatusSlot(slot);
                          else toast.error(!isFacilityActive ? 'Không thể chỉnh sửa slot của tòa nhà đang bị vô hiệu hóa.' : 'Không thể chỉnh sửa slot của tầng đang bị vô hiệu hóa.');
                        }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${(floor.status === 'active' && isFacilityActive) ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-not-allowed opacity-75'} transition-all shadow-sm border ${bgClass}`}
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
