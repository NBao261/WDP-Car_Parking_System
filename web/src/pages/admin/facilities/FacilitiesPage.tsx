import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin, Plus, Building2, ChevronLeft,
  Clock, Layers,
} from 'lucide-react';
import { facilityService, Facility } from '../../../services/facility.service';
import { floorService, Floor } from '../../../services/floor.service';
import { vehicleTypeService, VehicleType } from '../../../services/vehicleType.service';
import { FacilityFormModal } from './components/FacilityFormModal';
import { FloorFormModal } from './components/FloorFormModal';
import { FacilityCard } from './components/FacilityCard';
import { FloorGrid, type FloorSlotStats } from './components/FloorCard';
import { SlotMappingEditorView } from './components/SlotMappingEditorView';
import { slotService, type ParkingSlot } from '../../../services/slot.service';



// ── Skeleton Card (stable reference, no re-creation on parent render) ────────
function SkeletonFacilityCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eae8] p-5 space-y-3 animate-pulse h-52">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [allSlots, setAllSlots] = useState<ParkingSlot[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [viewFacility, setViewFacility] = useState<Facility | null>(null);

  // ── Slot stats derived from real slot data ────────────────────────────────
  // Map: floorId → { total, occupied, fillRate }
  const slotStatsByFloor = useMemo<Record<string, FloorSlotStats>>(() => {
    const map: Record<string, FloorSlotStats> = {};
    // Group slots by floorId
    const byFloor: Record<string, ParkingSlot[]> = {};
    for (const slot of allSlots) {
      if (!byFloor[slot.floorId]) byFloor[slot.floorId] = [];
      byFloor[slot.floorId].push(slot);
    }
    // Calculate per-floor stats
    for (const floor of floors) {
      const floorSlots = byFloor[floor._id] ?? [];
      const total = floor.totalSlots ?? floorSlots.length;
      const occupied = floorSlots.filter(s => s.status === 'occupied').length;
      const fillRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
      map[floor._id] = { total, occupied, fillRate };
    }
    return map;
  }, [allSlots, floors]);

  // ── Per-facility aggregate (sum over its floors) ──────────────────────────
  const facilityStats = useMemo<Record<string, { totalSlots: number; occupied: number; fillRate: number }>>(() => {
    const map: Record<string, { totalSlots: number; occupied: number; fillRate: number }> = {};
    for (const facility of facilities) {
      const facilityFloors = floors.filter(f => f.facilityId === facility._id);
      const totalSlots = facilityFloors.reduce((sum, f) => sum + (slotStatsByFloor[f._id]?.total ?? f.totalSlots ?? 0), 0);
      const occupied = facilityFloors.reduce((sum, f) => sum + (slotStatsByFloor[f._id]?.occupied ?? 0), 0);
      const fillRate = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;
      map[facility._id] = { totalSlots, occupied, fillRate };
    }
    return map;
  }, [facilities, floors, slotStatsByFloor]);

  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>();
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | undefined>();

  const [mapFloor, setMapFloor] = useState<Floor | null>(null);
  const [mapSlots, setMapSlots] = useState<ParkingSlot[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const vtMap = Object.fromEntries(vehicleTypes.map((v) => [v._id, v.name]));

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch facilities, floors, vehicleTypes in parallel;
      // slots are fetched per-floor lazily (or all at once if API supports it)
      const [fRes, flRes, vtRes] = await Promise.all([
        facilityService.getAll({ limit: 100 }),
        floorService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
      ]);
      const fetchedFloors = flRes.data;
      setFacilities(fRes.data);
      setFloors(fetchedFloors);
      setVehicleTypes(vtRes.data);

      // Fetch slots for ALL floors in parallel to compute real occupancy
      if (fetchedFloors.length > 0) {
        try {
          const slotResults = await Promise.all(
            fetchedFloors.map((fl: Floor) => slotService.getByFloor(fl._id).catch(() => ({ data: [] as ParkingSlot[] })))
          );
          const slots = slotResults.flatMap((r: { data: ParkingSlot[] }) => r.data);
          setAllSlots(slots);
        } catch {
          // Slot fetch failure is non-critical — stats will show 0
          setAllSlots([]);
        }
      } else {
        setAllSlots([]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Optimistic updaters (no re-fetch needed) ─────────────────────────────
  const updateFacilityLocal = useCallback((updated: Facility) => {
    setFacilities(prev => prev.map(f => f._id === updated._id ? updated : f));
    // Keep viewFacility in sync
    setViewFacility(prev => prev && prev._id === updated._id ? updated : prev);
  }, []);

  const removeFacilityLocal = useCallback((id: string) => {
    setFacilities(prev => prev.filter(f => f._id !== id));
    setFloors(prev => prev.filter(f => f.facilityId !== id));
    setViewFacility(prev => prev && prev._id === id ? null : prev);
  }, []);

  const updateFloorLocal = useCallback((updated: Floor) => {
    setFloors(prev => prev.map(f => f._id === updated._id ? updated : f));
  }, []);

  const removeFloorLocal = useCallback((id: string) => {
    setFloors(prev => prev.filter(f => f._id !== id));
    setAllSlots(prev => prev.filter(s => s.floorId !== id));
    setMapFloor(prev => prev && prev._id === id ? null : prev);
  }, []);

  const filteredFloors = viewFacility
    ? floors.filter((f) => f.facilityId === viewFacility._id)
    : [];

  const handleViewFloors = useCallback((facility: Facility) => {
    setViewFacility(facility);
    setMapFloor(null);
  }, []);

  const handleEditMapping = useCallback((floor: Floor) => {
    setEditingFloor(floor);
    setIsFloorModalOpen(true);
  }, []);

  const handleViewMap = useCallback(async (floor: Floor) => {
    setMapFloor(floor);
    setMapLoading(true);
    try {
      const res = await slotService.getByFloor(floor._id);
      const sorted = res.data.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
      setMapSlots(sorted);
      setTimeout(() => {
        document.getElementById('slot-editor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      toast.error('Lỗi tải dữ liệu slot');
    } finally {
      setMapLoading(false);
    }
  }, []);


  return (
    <div className="space-y-6 pb-12">

      {/* ══ View 1: Facility List ══ */}
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
              <h1 className="text-2xl font-bold text-[#060606]">Tòa nhà & Bãi đỗ</h1>
              <p className="text-gray-400 text-sm">
                Quản lý các tòa nhà và bãi đỗ xe trong hệ thống
              </p>
            </div>
            <button
              onClick={() => { setEditingFacility(undefined); setIsFacilityModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 self-start sm:self-auto"
              style={{ background: '#d7ee46', color: '#1a1a0a' }}
            >
              <Plus size={16} /> Thêm cơ sở mới
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonFacilityCard key={i} />)}
            </div>
          ) : facilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8eae8] py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#EAF3DE' }}>
                <Building2 size={28} style={{ color: '#3B6D11' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#060606]">Không tìm thấy cơ sở nào</p>
                <p className="text-xs text-gray-400 mt-1">Thêm cơ sở đỗ xe đầu tiên để bắt đầu</p>
              </div>
              <button
                onClick={() => { setEditingFacility(undefined); setIsFacilityModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                style={{ background: '#d7ee46', color: '#1a1a0a' }}
              >
                <Plus size={16} /> Thêm cơ sở mới
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility._id}
                  facility={facility}
                  stats={facilityStats[facility._id]}
                  onEdit={(f) => { setEditingFacility(f); setIsFacilityModalOpen(true); }}
                  onViewFloors={handleViewFloors}
                  onUpdate={updateFacilityLocal}
                  onRemove={removeFacilityLocal}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ══ View 2: Floor List for a Facility ══ */}
      {viewFacility && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-5"
        >
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back button — ghost green border */}
              <button
                onClick={() => setViewFacility(null)}
                className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors hover:bg-[#f0f5e8]"
                style={{ borderColor: '#b8cc30', color: '#3B6D11' }}
              >
                <ChevronLeft size={15} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#060606] flex items-center gap-2">
                  <Building2 size={20} style={{ color: '#3B6D11' }} />
                  {viewFacility.name}
                </h1>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {viewFacility.address}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditingFloor(undefined); setIsFloorModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 self-start sm:self-auto"
              style={{ background: '#d7ee46', color: '#1a1a0a' }}
            >
              <Plus size={16} /> Thêm tầng
            </button>
          </div>

          {/* Facility summary strip */}
          <div className="bg-white rounded-2xl border border-[#e8eae8] px-5 py-3.5 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={13} /> {viewFacility.openTime} – {viewFacility.closeTime}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Layers size={13} /> {filteredFloors.length} tầng
            </div>
          </div>

          {/* Floor cards */}
          <FloorGrid
            isLoading={isLoading}
            floors={filteredFloors}
            vehicleTypes={vehicleTypes}
            slotStats={slotStatsByFloor}
            onAddFloor={() => { setEditingFloor(undefined); setIsFloorModalOpen(true); }}
            onEditFloor={handleEditMapping}
            onUpdate={updateFloorLocal}
            onRemove={removeFloorLocal}
            onRefresh={fetchAll}
            onViewMap={handleViewMap}
          />

          {/* Slot map panel */}
          <SlotMappingEditorView
            floor={mapFloor}
            slots={mapSlots}
            vtMap={vtMap}
            vehicleTypes={vehicleTypes}
            loading={mapLoading}
            onRefreshSlots={async () => {
              if (!mapFloor) return;
              setMapLoading(true);
              try {
                const res = await slotService.getByFloor(mapFloor._id);
                const sorted = res.data.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
                setMapSlots(sorted);
                // Patch global slot state for this floor only (no fetchAll needed)
                setAllSlots(prev => [
                  ...prev.filter(s => s.floorId !== mapFloor._id),
                  ...sorted,
                ]);
              } catch {
                toast.error('Lỗi tải dữ liệu slot');
              } finally {
                setMapLoading(false);
              }
            }}
          />
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
          currentFloorCount={filteredFloors.length}
          maxFloors={viewFacility.totalFloors}
        />
      )}
    </div>
  );
}
