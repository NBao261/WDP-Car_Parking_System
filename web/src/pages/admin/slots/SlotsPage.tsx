import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2, ChevronDown, Plus, Layers, Loader2, GripHorizontal, Car
} from 'lucide-react';
import { ICON_MAP } from '../vehicles/components/constants';
import { facilityService, type Facility } from '../../../services/facility.service';
import { floorService, type Floor } from '../../../services/floor.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import { slotService, type ParkingSlot, type SlotStatus } from '../../../services/slot.service';
import { SlotStatusModal } from './components/SlotStatusModal';
import { SlotFormModal } from './components/SlotFormModal';

// ── Main Page ─────────────────────────────────────────────
export default function SlotsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  const [facilityDropOpen, setFacilityDropOpen] = useState(false);
  const [floorDropOpen, setFloorDropOpen] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [, setSlotsLoading] = useState(false);

  const [statusSlot, setStatusSlot] = useState<ParkingSlot | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState<SlotStatus | 'all'>('all');

  // Load initial data
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        const [fRes, vtRes] = await Promise.all([
          facilityService.getAll({ limit: 100 }),
          vehicleTypeService.getAll({ limit: 100 }),
        ]);
        setFacilities(fRes.data);
        setVehicleTypes(vtRes.data);
        if (fRes.data.length > 0) setSelectedFacility(fRes.data[0]);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load data');
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // Load floors when facility changes
  useEffect(() => {
    if (!selectedFacility) return;
    setSelectedFloor(null);
    setSlots([]);
    floorService.getAll({ facilityId: selectedFacility._id, limit: 100 }).then((res) => {
      setFloors(res.data);
      if (res.data.length > 0) setSelectedFloor(res.data[0]);
    });
  }, [selectedFacility]);

  // Load slots when floor changes
  const loadSlots = useCallback(async () => {
    if (!selectedFloor) return;
    setSlotsLoading(true);
    try {
      const res = await slotService.getByFloor(selectedFloor._id);
      const sorted = res.data.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
      setSlots(sorted);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const vtMap = Object.fromEntries(vehicleTypes.map((v) => [v._id, v.name]));
  const filteredSlots = filterStatus === 'all' ? slots : slots.filter((s) => s.status === filterStatus);

  const filterButtons: { label: string; value: SlotStatus | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Trống', value: 'available' },
    { label: 'Đang dùng', value: 'occupied' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Bảo trì', value: 'maintenance' },
    { label: 'Khóa', value: 'locked' },
  ];

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Sơ đồ Slot</h1>
          <p className="text-gray-500 text-sm">Quản lý và cập nhật sơ đồ vị trí đỗ xe</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-3">
        {/* Facility Selector */}
        <div className="relative">
          <button
            onClick={() => setFacilityDropOpen((v) => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-48"
          >
            <Building2 size={16} className="text-gray-400" />
            <span className="flex-1 text-left truncate">
              {selectedFacility?.name ?? 'Chọn Cơ Sở'}
            </span>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
          <AnimatePresence>
            {facilityDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[220px]"
              >
                <div className="fixed inset-0 z-[-1]" onClick={() => setFacilityDropOpen(false)} />
                {facilities.map((f) => (
                  <button
                    key={f._id}
                    onClick={() => { setSelectedFacility(f); setFacilityDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedFacility?._id === f._id ? 'bg-[#d7ee46]/20 font-semibold text-[#060606]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {f.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floor Selector */}
        <div className="relative">
          <button
            onClick={() => floors.length > 0 && setFloorDropOpen((v) => !v)}
            disabled={floors.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Layers size={16} className="text-gray-400" />
            <span className="flex-1 text-left">{selectedFloor?.name ?? 'Chọn Tầng'}</span>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
          <AnimatePresence>
            {floorDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px]"
              >
                <div className="fixed inset-0 z-[-1]" onClick={() => setFloorDropOpen(false)} />
                {floors.map((fl) => (
                  <button
                    key={fl._id}
                    onClick={() => { setSelectedFloor(fl); setFloorDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedFloor?._id === fl._id ? 'bg-[#d7ee46]/20 font-semibold text-[#060606]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {fl.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>


      {/* Parking Facility Manager: Slot Mapping (Drag & Drop Concept) */}
      {selectedFloor && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#060606]">Sơ đồ Slot — {selectedFloor.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Nhấp vào một slot để thay đổi trạng thái</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBulkOpen(true)}
                className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={20} /> Tạo Slot
              </button>
            </div>
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap mb-6">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === btn.value
                  ? 'bg-[#d7ee46] text-[#060606] font-semibold'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tools Palette */}
            <div className="w-full lg:w-48 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3 shrink-0">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Loại Xe</h4>

              {vehicleTypes
                .filter(vt =>
                  selectedFloor.allowedVehicleTypes.some((allowed: any) =>
                    (typeof allowed === 'string' ? allowed : allowed._id) === vt._id
                  )
                )
                .map((vt) => {
                  const Icon = (vt.icon && ICON_MAP[vt.icon]) ? ICON_MAP[vt.icon] : Car;
                  return (
                    <div key={vt._id} className="bg-white border border-gray-200 p-2 rounded-lg text-sm flex items-center gap-2 cursor-grab hover:shadow-sm transition-shadow text-gray-700">
                      <GripHorizontal size={14} className="opacity-50" /> <Icon size={16} className="text-gray-500" /> {vt.name}
                    </div>
                  );
                })}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 relative min-h-[300px] overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="flex gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div> Đang dùng</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div> Đã đặt</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div> Bảo trì / Khóa</div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {filteredSlots.map((slot) => {
                    const vtName = (slot.vehicleTypeId && typeof slot.vehicleTypeId === 'object') ? slot.vehicleTypeId.name : (slot.vehicleTypeId ? (vtMap[slot.vehicleTypeId] ?? '') : '');

                    let bgClass = '';
                    if (slot.status === 'occupied') {
                      bgClass = 'bg-green-100 border-green-300 text-green-700';
                    } else if (slot.status === 'reserved') {
                      bgClass = 'bg-blue-100 border-blue-200 text-blue-700';
                    } else if (slot.status === 'maintenance' || slot.status === 'locked') {
                      bgClass = 'bg-red-50 border-red-200 text-red-600';
                    } else {
                      // available / empty
                      bgClass = 'bg-white border-gray-200 text-gray-500';
                    }

                    return (
                      <div
                        key={slot._id}
                        onClick={() => setStatusSlot(slot)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-colors hover:opacity-80 shadow-sm border ${bgClass}`}
                        title={`${slot.code} - ${vtName} (${slot.status})`}
                      >
                        {slot.code}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {statusSlot && (
          <SlotStatusModal
            slot={statusSlot}
            onClose={() => setStatusSlot(null)}
            onSuccess={loadSlots}
          />
        )}
        {bulkOpen && selectedFacility && selectedFloor && (
          <SlotFormModal
            facilityId={selectedFacility._id}
            floorId={selectedFloor._id}
            vehicleTypes={vehicleTypes.filter(vt =>
              (selectedFloor.allowedVehicleTypes || []).some((allowed: any) =>
                (typeof allowed === 'string' ? allowed : allowed._id) === vt._id
              )
            )}
            totalSlots={selectedFloor.totalSlots}
            currentSlotCount={slots.length}
            onClose={() => setBulkOpen(false)}
            onSuccess={loadSlots}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
