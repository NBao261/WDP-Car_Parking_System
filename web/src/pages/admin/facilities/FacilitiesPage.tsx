import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import { FacilityFormModal } from './components/FacilityFormModal';
import { FloorFormModal } from './components/FloorFormModal';
import { FacilityCard, FacilityListItem } from './components/FacilityCard';
import { FacilityDetailModal } from './components/FacilityDetailModal';
import { SlotMappingEditorView } from './components/SlotMappingEditorView';
import { useFacilitiesData } from './hooks/useFacilitiesData';
import { FacilityFilterBar } from './components/FacilityFilterBar';
import { FacilityFloorsView } from './components/FacilityFloorsView';
import { slotService, type ParkingSlot } from '../../../services/slot.service';
import { toast } from 'sonner';
import { Facility } from '../../../services/facility.service';
import { Floor } from '../../../services/floor.service';
import { vehicleTypeService } from '../../../services/vehicleType.service';

// ── Skeleton Card ────────
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
  const data = useFacilitiesData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>();
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | undefined>();
  const vtMap = Object.fromEntries(data.vehicleTypes.map((v) => [v._id, v.name]));

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* ══ View 1: Facility List ══ */}
      {!data.viewFacility && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-[#060606]">Tòa nhà & Bãi đỗ</h1>
              <p className="text-gray-400 text-sm">
                Quản lý các tòa nhà và bãi đỗ xe trong hệ thống
              </p>
            </div>
            <button
              onClick={() => { setEditingFacility(undefined); setIsFacilityModalOpen(true); }}
              className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              <Plus size={20} /> Thêm Cơ Sở
            </button>
          </div>

          <FacilityFilterBar
            search={data.search} setSearch={data.setSearch}
            statusFilter={data.statusFilter} setStatusFilter={data.setStatusFilter}
            vehicleFilter={data.vehicleFilter} setVehicleFilter={data.setVehicleFilter}
            vehicleTypes={data.vehicleTypes}
            viewMode={viewMode} setViewMode={setViewMode}
          />

          {data.isLoading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonFacilityCard key={i} />)}
            </div>
          ) : data.paginatedFacilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8eae8] py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(215,238,70,0.15)' }}>
                <Building2 size={28} style={{ color: '#4a7c20' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#060606]">Không tìm thấy cơ sở nào</p>
                <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
              <button
                onClick={() => { data.setSearch(''); data.setStatusFilter('all'); data.setVehicleFilter('all'); }}
                className="bg-[#f0f1f0] text-[#060606] font-medium px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.paginatedFacilities.map((facility) => (
                  <FacilityCard
                    key={facility._id}
                    facility={facility}
                    stats={data.facilityStats[facility._id]}
                    onEdit={(f) => { setEditingFacility(f); setIsFacilityModalOpen(true); }}
                    onViewFloors={(f) => { data.setViewFacility(f); data.setMapFloor(null); }}
                    onUpdate={data.updateFacilityLocal}
                    onRemove={data.removeFacilityLocal}
                    onViewDetail={data.setDetailFacility}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.paginatedFacilities.map((facility) => (
                  <FacilityListItem
                    key={facility._id}
                    facility={facility}
                    stats={data.facilityStats[facility._id]}
                    onViewFloors={(f) => { data.setViewFacility(f); data.setMapFloor(null); }}
                    onViewDetail={data.setDetailFacility}
                  />
                ))}
              </div>
            )
          )}

          {/* Pagination Controls */}
          {data.totalFiltered > 0 && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Hiển thị {((data.currentPage - 1) * data.itemsPerPage) + 1} - {Math.min(data.currentPage * data.itemsPerPage, data.totalFiltered)} trong số {data.totalFiltered} cơ sở
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => data.setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={data.currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => data.setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${data.currentPage === i + 1 ? 'bg-[#cce242] text-[#060606] border border-[#b8cc30]' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => data.setCurrentPage((p: number) => Math.min(data.totalPages, p + 1))}
                  disabled={data.currentPage === data.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ══ View 2: Floor List for a Facility ══ */}
      {data.viewFacility && (
        <FacilityFloorsView
          viewFacility={data.viewFacility}
          setViewFacility={data.setViewFacility}
          filteredFloors={data.filteredFloors}
          vehicleTypes={data.vehicleTypes}
          facilityStats={data.facilityStats}
          slotStatsByFloor={data.slotStatsByFloor}
          isLoading={data.isLoading}
          setEditingFloor={setEditingFloor}
          setIsFloorModalOpen={setIsFloorModalOpen}
          handleEditMapping={(f) => { setEditingFloor(f); setIsFloorModalOpen(true); }}
          updateFloorLocal={data.updateFloorLocal}
          removeFloorLocal={data.removeFloorLocal}
          fetchAll={data.fetchAll}
          handleViewMap={data.handleViewMap}
        />
      )}

      {/* ══ View 3: Slot Mapping Editor Inline ══ */}
      {data.mapFloor && data.viewFacility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          id="slot-editor"
        >
          <SlotMappingEditorView
            floor={data.mapFloor}
            slots={data.mapSlots}
            vtMap={vtMap}
            vehicleTypes={data.vehicleTypes}
            loading={data.mapLoading}
            onRefreshSlots={async () => {
              data.setMapLoading(true);
              try {
                const [res, vtRes] = await Promise.all([
                  slotService.getByFloor(data.mapFloor!._id),
                  vehicleTypeService.getAll({ limit: 100 })
                ]);
                data.setVehicleTypes(vtRes.data);

                const sorted = res.data.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
                data.setMapSlots(sorted);
                data.setAllSlots((prev: ParkingSlot[]) => [
                  ...prev.filter(s => s.floorId !== data.mapFloor!._id),
                  ...sorted,
                ]);
              } catch {
                toast.error('Lỗi tải dữ liệu');
              } finally {
                data.setMapLoading(false);
              }
            }}
            onClose={() => data.setMapFloor(null)}
          />
        </motion.div>
      )}

      {/* ── Modals ── */}
      <FacilityFormModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        facility={editingFacility}
        onSuccess={data.fetchAll}
      />

      <FacilityDetailModal
        isOpen={!!data.detailFacility}
        onClose={() => data.setDetailFacility(null)}
        facility={data.detailFacility ?? undefined}
        stats={data.detailFacility ? data.facilityStats[data.detailFacility._id] : undefined}
        currentFloors={data.detailFacility ? data.floors.filter(f => f.facilityId === data.detailFacility!._id).length : 0}
        vehicleTypes={data.detailFacilityVehicleTypes}
      />

      {data.viewFacility && (
        <FloorFormModal
          isOpen={isFloorModalOpen}
          onClose={() => { setIsFloorModalOpen(false); setEditingFloor(undefined); }}
          floor={editingFloor}
          facilityId={data.viewFacility._id}
          vehicleTypes={data.vehicleTypes}
          onSuccess={data.fetchAll}
          currentFloorCount={data.filteredFloors.length}
          maxFloors={data.viewFacility.totalFloors}
        />
      )}
    </div>
  );
}
