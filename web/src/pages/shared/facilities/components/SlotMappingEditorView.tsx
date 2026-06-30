import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, GripHorizontal, Map, Car, ChevronLeft, Camera } from 'lucide-react';
import { Floor } from '../../../../services/floor.service';
import { ParkingSlot, SlotStatus, ParkingSessionPopulated } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { SlotStatusModal } from './SlotStatusModal';
import { SlotFormModal } from './SlotFormModal';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';

interface SlotGroup {
  name: string;
  icon: string;
  slots: ParkingSlot[];
}

interface SlotMappingEditorViewProps {
  floor: Floor | null;
  slots: ParkingSlot[];
  vtMap: Record<string, string>;
  vehicleTypes: VehicleType[];
  loading: boolean;
  onRefreshSlots: (silent?: boolean) => void;
  onClose?: () => void;
  isFacilityActive?: boolean;
}

export function SlotMappingEditorView({
  floor,
  slots,
  vtMap,
  vehicleTypes,
  loading,
  onRefreshSlots,
  onClose,
  isFacilityActive = true,
}: SlotMappingEditorViewProps) {
  const [filterStatus, setFilterStatus] = useState<SlotStatus | 'all'>('all');
  const [statusSlot, setStatusSlot] = useState<ParkingSlot | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

  // Helper to extract session data from a slot
  const getSessionData = (slot: ParkingSlot): ParkingSessionPopulated | null => {
    if (slot.status === 'occupied' && slot.currentSessionId && typeof slot.currentSessionId === 'object') {
      return slot.currentSessionId as ParkingSessionPopulated;
    }
    return null;
  };

  if (!floor) return null;

  const filteredSlots =
    filterStatus === 'all' ? slots : slots.filter((s) => s.status === filterStatus);

  // Group slots by vehicle type
  const groupedSlots = useMemo(() => {
    const groups: Record<string, SlotGroup> = {};
    const ungrouped: ParkingSlot[] = [];

    filteredSlots.forEach((slot) => {
      const vtId =
        slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object'
          ? slot.vehicleTypeId._id
          : (slot.vehicleTypeId as string) || '';

      if (!vtId) {
        ungrouped.push(slot);
        return;
      }

      if (!groups[vtId]) {
        const vtObj =
          slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object'
            ? slot.vehicleTypeId
            : null;
        const vtFromList = vehicleTypes.find((v) => v._id === vtId);
        groups[vtId] = {
          name: vtObj?.name || vtFromList?.name || vtMap[vtId] || vtId,
          icon: vtObj?.icon || vtFromList?.icon || '',
          slots: [],
        };
      }
      groups[vtId].slots.push(slot);
    });

    const entries: [string, SlotGroup][] = Object.entries(groups);
    if (ungrouped.length > 0) {
      entries.push(['_ungrouped', { name: 'Khác', icon: '', slots: ungrouped }]);
    }
    return entries;
  }, [filteredSlots, vehicleTypes, vtMap]);

  const filterButtons: { label: string; value: SlotStatus | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Trống', value: 'available' },
    { label: 'Đang dùng', value: 'occupied' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Bảo trì', value: 'maintenance' },
    { label: 'Khóa', value: 'locked' },
  ];

  // Allowed vehicle types for this floor
  const floorVehicleTypes = vehicleTypes.filter((vt) =>
    (floor.allowedVehicleTypes || []).some(
      (allowed: any) => (typeof allowed === 'string' ? allowed : allowed._id) === vt._id
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
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-[#062F28] hover:bg-[#9FE870]/20 rounded-xl transition-colors border border-gray-200 hover:border-[#9FE870]"
              title="Quay lại danh sách tầng"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#062F28]">
              Sơ đồ vị trí đỗ xe — Tầng {floor.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Nhấp vào một slot để thay đổi trạng thái</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === btn.value
                    ? 'bg-[#9FE870] text-[#062F28] font-semibold'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshSlots()}
              title="Làm mới"
              className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Body: palette + canvas */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Vehicle types palette */}
          <div className="w-full lg:w-44 bg-gray-50 rounded-xl border border-gray-200 shrink-0 relative min-h-[260px]">
            <div className="absolute inset-0 p-4 flex flex-col">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 shrink-0">
                Loại xe
              </h4>
              <div className="overflow-y-auto space-y-2.5 pr-1 vehicle-scrollbar h-full">
                <style>{`
                  .vehicle-scrollbar::-webkit-scrollbar { width: 4px; }
                  .vehicle-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .vehicle-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                  .vehicle-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                `}</style>
                {floorVehicleTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Chưa gán loại xe</p>
                ) : (
                  floorVehicleTypes.map((vt) => {
                    const Icon = vt.icon && ICON_MAP[vt.icon] ? ICON_MAP[vt.icon] : Car;
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
                  })
                )}
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
                {slots.length === 0
                  ? `Tầng này chưa có slot nào (0/${floor.totalSlots}).`
                  : 'Không có slot phù hợp bộ lọc.'}
              </div>
            ) : (
              <div className="min-w-[500px]">
                {/* Legend */}
                <div className="flex gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-green-100 border border-green-300" />{' '}
                    Đang dùng
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-200" /> Đã
                    đặt
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-red-50 border border-red-200" /> Bảo trì
                    / Khóa
                  </div>
                </div>

                {/* Slot rows grouped by vehicle type */}
                <div className="space-y-5">
                  {groupedSlots.map(([vtId, group]) => {
                    const Icon =
                      group.icon && ICON_MAP[group.icon] ? ICON_MAP[group.icon] : Car;
                    return (
                      <div key={vtId}>
                        {/* Vehicle type label */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#9FE870]/20 flex items-center justify-center shrink-0">
                            <Icon size={15} className="text-[#062F28]" />
                          </div>
                          <span className="text-sm font-bold text-[#062F28]">
                            {group.name}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            ({group.slots.length} slot)
                          </span>
                          <div className="flex-1 h-px bg-gray-200 ml-2" />
                        </div>
                        {/* Slots row */}
                        <div className="flex flex-wrap gap-2.5 pl-9">
                          {group.slots.map((slot) => {
                            let bgClass = 'bg-white border-gray-200 text-gray-500';
                            if (slot.status === 'occupied')
                              bgClass = 'bg-green-100 border-green-300 text-green-700';
                            else if (slot.status === 'reserved')
                              bgClass = 'bg-blue-100 border-blue-200 text-blue-700';
                            else if (
                              slot.status === 'maintenance' ||
                              slot.status === 'locked'
                            )
                              bgClass = 'bg-red-50 border-red-200 text-red-600';

                            return (
                              <div
                                key={slot._id}
                                onClick={() => {
                                  if (floor.status === 'active' && isFacilityActive)
                                    setStatusSlot(slot);
                                  else
                                    toast.error(
                                      !isFacilityActive
                                        ? 'Không thể chỉnh sửa slot của tòa nhà đang bị vô hiệu hóa.'
                                        : 'Không thể chỉnh sửa slot của tầng đang bị vô hiệu hóa.'
                                    );
                                }}
                                onMouseEnter={() => setHoveredSlotId(slot._id)}
                                onMouseLeave={() => setHoveredSlotId(null)}
                                className={`relative w-20 h-12 rounded-lg flex items-center justify-center text-sm font-semibold ${floor.status === 'active' && isFacilityActive ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-not-allowed opacity-75'} transition-all shadow-sm border ${bgClass}`}
                                title={`${slot.code} – ${group.name} (${slot.status})`}
                              >
                                {slot.code}
                                {/* Camera badge for occupied slots with image */}
                                {(() => {
                                  const session = getSessionData(slot);
                                  if (session?.checkInImage) {
                                    return (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                                        <Camera size={9} className="text-white" />
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                                {/* Hover tooltip with vehicle image */}
                                {hoveredSlotId === slot._id && (() => {
                                  const session = getSessionData(slot);
                                  if (!session) return null;
                                  return (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                                      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[160px]">
                                        {session.checkInImage ? (
                                          <img
                                            src={session.checkInImage}
                                            alt={`Xe ${session.licensePlate}`}
                                            className="w-36 h-24 object-cover rounded-lg mb-1.5"
                                          />
                                        ) : (
                                          <div className="w-36 h-24 bg-gray-100 rounded-lg mb-1.5 flex items-center justify-center">
                                            <Car size={24} className="text-gray-300" />
                                          </div>
                                        )}
                                        <p className="text-xs font-bold text-center text-[#062F28]">
                                          {session.licensePlate || 'Không có biển số'}
                                        </p>
                                      </div>
                                      <div className="w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
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
            onSuccess={() => {
              setStatusSlot(null);
              onRefreshSlots(true);
            }}
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
            onSuccess={() => {
              setBulkOpen(false);
              onRefreshSlots(true);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
