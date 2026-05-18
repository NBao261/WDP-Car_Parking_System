import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin, Plus, BatteryCharging, Wrench, CheckCircle2,
  Building2, ChevronLeft, MoreVertical, Edit, PowerOff, CheckCircle, Trash2, Loader2
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { facilityService, Facility } from '../../../services/facility.service';
import { floorService, Floor } from '../../../services/floor.service';
import { vehicleTypeService, VehicleType } from '../../../services/vehicleType.service';
import { FacilityFormModal } from './components/FacilityFormModal';
import { FloorFormModal } from './components/FloorFormModal';
import { FacilityCard } from './components/FacilityCard';
import { SlotGrid } from '../../../components/ui/SlotGrid';
import { slotService, type ParkingSlot } from '../../../services/slot.service';



// ── Floor Card ───────────────────────────────────────────
interface FloorCardProps {
  floor: Floor;
  vehicleTypes: VehicleType[];
  onEdit: (floor: Floor) => void;
  onRefresh: () => void;
  onViewMap: (floor: Floor) => void;
}

function FloorCard({ floor, vehicleTypes, onEdit, onRefresh, onViewMap }: FloorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const used = 0; // real-time occupancy → future integration
  const total = floor.totalSlots || 1;
  const ratio = used / total;
  const barColor = ratio > 0.9 ? 'bg-red-500' : ratio > 0.7 ? 'bg-orange-500' : 'bg-green-500';

  const vtNames = (floor.allowedVehicleTypes || [])
    .map((item: any) => {
      const typeId = typeof item === 'string' ? item : item._id;
      return vehicleTypes.find((v) => v._id === typeId)?.name || item.name;
    })
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
              Floor: {floor.name} • {vtNames || 'No vehicle types assigned'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {floor.status === 'active' ? (
            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
          ) : (
            <Wrench size={20} className="text-orange-500 flex-shrink-0" />
          )}
          
          <div className="relative">
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={18} />
              </button>
            )}

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20"
                >
                  <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                  <button
                    onClick={() => { onEdit(floor); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  {floor.status === 'active' ? (
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        setLoading(true);
                        try {
                          await floorService.update(floor._id, { status: 'inactive' });
                          toast.success(`Deactivated floor ${floor.name}`);
                          onRefresh();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <PowerOff size={14} /> Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setMenuOpen(false);
                        setLoading(true);
                        try {
                          await floorService.update(floor._id, { status: 'active' });
                          toast.success(`Activated floor ${floor.name}`);
                          onRefresh();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                    >
                      <CheckCircle size={14} /> Reactivate
                    </button>
                  )}
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      if (!window.confirm(`Delete floor "${floor.name}"?`)) return;
                      setLoading(true);
                      try {
                        await floorService.softDelete(floor._id);
                        toast.success('Floor deleted successfully');
                        onRefresh();
                      } catch (err: any) {
                        toast.error(err.message || 'Deletion failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Floor
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
            onClick={() => onViewMap(floor)}
            className="text-sm font-medium text-[#060606] hover:underline"
          >
            Floor Map &rarr;
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SlotMappingEditorView({ floor, slots, vtMap, loading }: { floor: Floor | null; slots: ParkingSlot[]; vtMap: Record<string, string>; loading: boolean }) {
  if (!floor) return null;

  return (
    <div id="slot-editor" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#060606]">
            Floor Map: {floor.name}
          </h2>
          <p className="text-sm text-gray-500">
            View current slot layout for this floor. Manage slots in Slot Manager.
          </p>
        </div>
        <Link 
          to="/admin/slots"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d7ee46] text-[#060606] font-bold text-sm rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm"
        >
          Go to Slot Manager &rarr;
        </Link>
      </div>
      
      <SlotGrid slots={slots} vehicleTypeMap={vtMap} readOnly isLoading={loading} />
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

  const [mapFloor, setMapFloor] = useState<Floor | null>(null);
  const [mapSlots, setMapSlots] = useState<ParkingSlot[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const vtMap = Object.fromEntries(vehicleTypes.map((v) => [v._id, v.name]));

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
      toast.error(err.message || 'Failed to load data');
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
    setMapFloor(null);
  };

  const handleEditMapping = (floor: Floor) => {
    setEditingFloor(floor);
    setIsFloorModalOpen(true);
  };

  const handleViewMap = useCallback(async (floor: Floor) => {
    setMapFloor(floor);
    setMapLoading(true);
    try {
      const res = await slotService.getByFloor(floor._id);
      setMapSlots(res.data);
      setTimeout(() => {
        document.getElementById('slot-editor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      toast.error('Failed to load slots');
    } finally {
      setMapLoading(false);
    }
  }, []);

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
                Manage buildings and parking facilities in the system
              </p>
            </div>
            <button
              onClick={() => { setEditingFacility(undefined); setIsFacilityModalOpen(true); }}
              className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-medium hover:bg-[#c4dc32] transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Facility
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
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
              <p className="text-gray-500 font-medium">No Facilities found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Manage floors for this facility
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
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
              <p className="text-gray-500 font-medium">No floors found for this facility.</p>
              <button
                onClick={() => { setEditingFloor(undefined); setIsFloorModalOpen(true); }}
                className="mt-4 bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} /> Add Floor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFloors.map((floor) => (
                <FloorCard
                  key={floor._id}
                  floor={floor}
                  vehicleTypes={vehicleTypes}
                  onEdit={handleEditMapping}
                  onRefresh={fetchAll}
                  onViewMap={handleViewMap}
                />
              ))}
            </div>
          )}

          {/* Slot Mapping View */}
          <SlotMappingEditorView
            floor={mapFloor}
            slots={mapSlots}
            vtMap={vtMap}
            loading={mapLoading}
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
        />
      )}
    </div>
  );
}
