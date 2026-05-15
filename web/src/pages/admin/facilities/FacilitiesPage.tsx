import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin, Plus, BatteryCharging, Wrench, CheckCircle2,
  GripHorizontal, Building2, ChevronLeft,
} from 'lucide-react';
import { facilityService, Facility } from '../../../services/facility.service';
import { floorService, Floor } from '../../../services/floor.service';
import { vehicleTypeService, VehicleType } from '../../../services/vehicleType.service';
import { FacilityFormModal } from './components/FacilityFormModal';
import { FloorFormModal } from './components/FloorFormModal';
import { FacilityCard } from './components/FacilityCard';

// ── Slot type ───────────────────────────────────────────
type SlotType = 'ev' | 'standard' | 'reserved' | 'wall';
interface SlotState { type: SlotType }

const SLOT_DEFAULTS: SlotState[] = Array.from({ length: 40 }, (_, i) => {
  if (i < 12) return { type: 'ev' };
  if (i === 12 || i === 13) return { type: 'reserved' };
  if (i === 24 || i === 25) return { type: 'wall' };
  return { type: 'standard' };
});

const slotClass: Record<SlotType, string> = {
  ev: 'bg-[#d7ee46] border border-[#b5cc32] text-[#556314]',
  standard: 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50',
  reserved: 'bg-blue-100 border border-blue-200 text-blue-700',
  wall: 'bg-gray-300 border-none text-transparent',
};

// ── Floor Card ───────────────────────────────────────────
interface FloorCardProps {
  floor: Floor;
  vehicleTypes: VehicleType[];
  onEditMapping: (floor: Floor) => void;
}

function FloorCard({ floor, vehicleTypes, onEditMapping }: FloorCardProps) {
  const used = 0; // real-time occupancy → future integration
  const total = floor.totalSlots || 1;
  const ratio = used / total;
  const barColor = ratio > 0.9 ? 'bg-red-500' : ratio > 0.7 ? 'bg-orange-500' : 'bg-green-500';

  const vtNames = (floor.allowedVehicleTypes || [])
    .map((id) => vehicleTypes.find((v) => v._id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const isEV =
    vtNames.toLowerCase().includes('ev') || vtNames.toLowerCase().includes('điện');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEV ? 'bg-[#d7ee46]/20 text-[#7a8c17]' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#060606] leading-tight">{floor.name}</h3>
            <p className="text-sm text-gray-500">
              Floor: {floor.name} • {vtNames || 'Chưa gán loại xe'}
            </p>
          </div>
        </div>
        {floor.status === 'active' ? (
          <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
        ) : (
          <Wrench size={20} className="text-orange-500 flex-shrink-0" />
        )}
      </div>

      {/* Capacity */}
      <div className="mt-auto">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Capacity</span>
          <span className="font-semibold text-[#060606]">{used} / {total}</span>
        </div>
        <div className="bg-gray-100 h-2.5 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(ratio * 100, 0)}%` }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          {isEV ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <BatteryCharging size={16} className="text-[#96a827]" />
              <span>{total} Chargers</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Standard</span>
          )}
          <button
            onClick={() => onEditMapping(floor)}
            className="text-sm font-medium text-[#060606] hover:underline"
          >
            Edit Mapping &rarr;
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Slot Mapping Editor ─────────────────────────────────
function SlotMappingEditor() {
  const [slots, setSlots] = useState<SlotState[]>(SLOT_DEFAULTS);
  const [dragType, setDragType] = useState<SlotType | null>(null);

  const paintSlot = (i: number) => {
    if (!dragType) return;
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { type: dragType } : s)));
  };

  const tools: { type: SlotType; label: string; cls: string }[] = [
    { type: 'standard', label: 'Standard Slot', cls: 'bg-white border border-gray-200' },
    { type: 'ev', label: 'EV Slot', cls: 'bg-[#d7ee46]/10 border border-[#b5cc32]/50' },
    { type: 'reserved', label: 'Reserved', cls: 'bg-blue-50 border border-blue-200' },
    { type: 'wall', label: 'Wall/Pillar', cls: 'bg-gray-200 border border-gray-300' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#060606]">
            Slot Mapping Editor (Drag &amp; Drop)
          </h2>
          <p className="text-sm text-gray-500">
            Facility Manager View: Configure physical layout for staff app.
          </p>
        </div>
        <button
          onClick={() => toast.success('Layout saved!')}
          className="mt-3 sm:mt-0 text-sm border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 font-medium transition-colors"
        >
          Save Layout
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Palette */}
        <div className="w-full lg:w-48 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3 flex-shrink-0">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Elements</h4>
          {tools.map((tool) => (
            <button
              key={tool.type}
              onMouseDown={() => setDragType(tool.type)}
              onMouseUp={() => setDragType(null)}
              className={`w-full ${tool.cls} p-2.5 rounded-xl text-sm flex items-center gap-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all text-left font-medium ${
                dragType === tool.type ? 'ring-2 ring-[#d7ee46] scale-[1.02]' : ''
              }`}
            >
              <GripHorizontal size={14} className="text-gray-400 flex-shrink-0" />
              {tool.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div
          className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 overflow-x-auto"
          onMouseLeave={() => setDragType(null)}
        >
          <div className="min-w-[600px]">
            {/* Legend */}
            <div className="flex gap-5 mb-5 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-gray-200" /> Empty
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#d7ee46] border border-[#b5cc32]" /> EV Charger
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" /> Reserved
              </div>
            </div>

            {/* Grid */}
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
            >
              {slots.map((slot, i) => (
                <div
                  key={i}
                  onMouseDown={() => { paintSlot(i); }}
                  onMouseEnter={() => dragType && paintSlot(i)}
                  onMouseUp={() => setDragType(null)}
                  title={slot.type === 'wall' ? 'Wall/Pillar' : `Slot ${i + 1}`}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold cursor-pointer select-none transition-colors ${slotClass[slot.type]}`}
                >
                  {slot.type !== 'wall'
                    ? i + 1 < 10 ? `E0${i + 1}` : `E${i + 1}`
                    : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────
export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controls the drill-down view: null means show all facilities, otherwise show floors for this facility
  const [viewFacility, setViewFacility] = useState<Facility | null>(null);

  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>();
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | undefined>();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fRes, flRes, vtRes] = await Promise.all([
        facilityService.getAll({ limit: 100 }),
        floorService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
      ]);
      setFacilities(fRes.data);
      setFloors(flRes.data);
      setVehicleTypes(vtRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredFloors = viewFacility
    ? floors.filter((f) => f.facilityId === viewFacility._id)
    : [];

  const handleEditFacility = (facility: Facility) => {
    setEditingFacility(facility);
    setIsFacilityModalOpen(true);
  };

  const handleViewFloors = (facility: Facility) => {
    setViewFacility(facility);
  };

  const handleEditMapping = (floor: Floor) => {
    setEditingFloor(floor);
    setIsFloorModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── View 1: List of Facilities ── */}
      {!viewFacility && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#060606]">Facilities</h1>
              <p className="text-gray-500 text-sm">
                Quản lý các tòa nhà và bãi đỗ xe trong hệ thống
              </p>
            </div>
            <button
              onClick={() => { setEditingFacility(undefined); setIsFacilityModalOpen(true); }}
              className="bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Facility
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse h-48">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có Facility nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility._id}
                  facility={facility}
                  onEdit={handleEditFacility}
                  onViewFloors={handleViewFloors}
                  onRefresh={fetchAll}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── View 2: Floors (Zones) in a specific Facility ── */}
      {viewFacility && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewFacility(null)}
                className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#060606] flex items-center gap-2">
                  <Building2 size={24} className="text-gray-400" />
                  {viewFacility.name}
                </h1>
                <p className="text-gray-500 text-sm">
                  Quản lý các tầng (floors) thuộc bãi xe này
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditingFloor(undefined); setIsFloorModalOpen(true); }}
              className="bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Floor
            </button>
          </div>

          {/* Floor Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse h-52">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded-full mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredFloors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có tầng (floor) nào cho bãi xe này.</p>
              <button
                onClick={() => { setEditingFloor(undefined); setIsFloorModalOpen(true); }}
                className="mt-4 bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} /> Add Floor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFloors.map((floor) => (
                <FloorCard
                  key={floor._id}
                  floor={floor}
                  vehicleTypes={vehicleTypes}
                  onEditMapping={handleEditMapping}
                />
              ))}
            </div>
          )}

          {/* Slot Mapping Editor */}
          <SlotMappingEditor />
        </motion.div>
      )}

      {/* ── Modals ── */}
      <FacilityFormModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        facility={editingFacility}
        onSuccess={fetchAll}
      />

      {viewFacility && (
        <FloorFormModal
          isOpen={isFloorModalOpen}
          onClose={() => { setIsFloorModalOpen(false); setEditingFloor(undefined); }}
          floor={editingFloor}
          facilityId={viewFacility._id}
          vehicleTypes={vehicleTypes}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
