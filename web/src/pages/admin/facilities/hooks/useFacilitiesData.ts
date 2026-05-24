import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { facilityService, Facility } from '../../../../services/facility.service';
import { floorService, Floor } from '../../../../services/floor.service';
import { vehicleTypeService, VehicleType } from '../../../../services/vehicleType.service';
import { slotService, type ParkingSlot } from '../../../../services/slot.service';
import { type FloorSlotStats } from '../components/FloorCard';

export function useFacilitiesData() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [allSlots, setAllSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewFacility, setViewFacility] = useState<Facility | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals / Details state
  const [detailFacility, setDetailFacility] = useState<Facility | null>(null);
  const [mapFloor, setMapFloor] = useState<Floor | null>(null);
  const [mapSlots, setMapSlots] = useState<ParkingSlot[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  // ── Fetching Data ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fRes, flRes, vtRes] = await Promise.all([
        facilityService.getAll({ limit: 100 }),
        floorService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
      ]);
      const fetchedFloors = flRes.data;
      setFacilities(fRes.data);
      setFloors(fetchedFloors);
      setVehicleTypes(vtRes.data);

      setIsLoading(false);

      if (fetchedFloors.length > 0) {
        try {
          const slotResults = await Promise.all(
            fetchedFloors.map((fl: Floor) => slotService.getByFloor(fl._id).catch(() => ({ data: [] as ParkingSlot[] })))
          );
          const slots = slotResults.flatMap((r: { data: ParkingSlot[] }) => r.data);
          setAllSlots(slots);
        } catch {
          setAllSlots([]);
        }
      } else {
        setAllSlots([]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải dữ liệu');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived Stats ───────────────────────────────────────────────────────────
  const slotStatsByFloor = useMemo<Record<string, FloorSlotStats>>(() => {
    const map: Record<string, FloorSlotStats> = {};
    const byFloor: Record<string, ParkingSlot[]> = {};
    for (const slot of allSlots) {
      if (!byFloor[slot.floorId]) byFloor[slot.floorId] = [];
      byFloor[slot.floorId].push(slot);
    }
    for (const floor of floors) {
      const floorSlots = byFloor[floor._id] ?? [];
      const total = floor.totalSlots ?? floorSlots.length;
      const occupied = floorSlots.filter(s => s.status === 'occupied').length;
      const fillRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
      map[floor._id] = { total, occupied, fillRate };
    }
    return map;
  }, [allSlots, floors]);

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

  const detailFacilityVehicleTypes = useMemo(() => {
    if (!detailFacility) return [];
    const facilityFloors = floors.filter(f => f.facilityId === detailFacility._id);
    const vtIds = new Set<string>();
    facilityFloors.forEach(fl => {
      fl.allowedVehicleTypes?.forEach((vt: any) => {
        vtIds.add(typeof vt === 'string' ? vt : vt._id);
      });
    });
    return Array.from(vtIds).map(id => vehicleTypes.find(v => v._id === id)).filter(Boolean) as VehicleType[];
  }, [detailFacility, floors, vehicleTypes]);

  // ── Filters & Pagination ────────────────────────────────────────────────────
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (search.trim() && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.address.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;

      if (vehicleFilter !== 'all') {
        const facilityFloors = floors.filter(fl => fl.facilityId === f._id);
        const hasVehicle = facilityFloors.some(fl =>
          fl.allowedVehicleTypes?.some((vt: any) =>
            (typeof vt === 'string' ? vt : vt._id) === vehicleFilter
          )
        );
        if (!hasVehicle) return false;
      }
      return true;
    });
  }, [facilities, search, statusFilter, vehicleFilter, floors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, vehicleFilter]);

  const paginatedFacilities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFacilities.slice(start, start + itemsPerPage);
  }, [filteredFacilities, currentPage]);

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const filteredFloors = viewFacility ? floors.filter((f) => f.facilityId === viewFacility._id) : [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  const updateFacilityLocal = useCallback((updated: Facility) => {
    setFacilities((prev: Facility[]) => prev.map(f => f._id === updated._id ? updated : f));
    setViewFacility((prev: Facility | null) => prev && prev._id === updated._id ? updated : prev);
  }, []);

  const removeFacilityLocal = useCallback((id: string) => {
    setFacilities((prev: Facility[]) => prev.filter(f => f._id !== id));
    setFloors((prev: Floor[]) => prev.filter(f => f.facilityId !== id));
    setViewFacility((prev: Facility | null) => prev && prev._id === id ? null : prev);
  }, []);

  const updateFloorLocal = useCallback((updated: Floor) => {
    setFloors((prev: Floor[]) => prev.map(f => f._id === updated._id ? updated : f));
  }, []);

  const removeFloorLocal = useCallback((id: string) => {
    setFloors((prev: Floor[]) => prev.filter(f => f._id !== id));
    setAllSlots((prev: ParkingSlot[]) => prev.filter(s => s.floorId !== id));
    setMapFloor((prev: Floor | null) => prev && prev._id === id ? null : prev);
  }, []);

  const handleViewMap = useCallback(async (floor: Floor) => {
    setMapFloor(floor);
    setMapLoading(true);
    try {
      const res = await slotService.getByFloor(floor._id);
      const sorted = res.data.sort((a: ParkingSlot, b: ParkingSlot) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
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

  return {
    facilities, setFacilities,
    floors, setFloors,
    vehicleTypes, setVehicleTypes,
    allSlots, setAllSlots,
    isLoading,
    
    // Filters & Pagination
    search, setSearch,
    statusFilter, setStatusFilter,
    vehicleFilter, setVehicleFilter,
    currentPage, setCurrentPage,
    itemsPerPage,
    paginatedFacilities,
    totalPages,
    totalFiltered: filteredFacilities.length,

    // Stats
    slotStatsByFloor,
    facilityStats,

    // Views & Modals
    viewFacility, setViewFacility,
    detailFacility, setDetailFacility,
    detailFacilityVehicleTypes,
    mapFloor, setMapFloor,
    mapSlots, setMapSlots,
    mapLoading, setMapLoading,
    filteredFloors,

    // Handlers
    fetchAll,
    updateFacilityLocal,
    removeFacilityLocal,
    updateFloorLocal,
    removeFloorLocal,
    handleViewMap
  };
}
