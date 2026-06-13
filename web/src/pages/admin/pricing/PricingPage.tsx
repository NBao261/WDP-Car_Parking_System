import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, DollarSign, Building2, MapPin, ArrowLeft, MoreHorizontal, FileText } from 'lucide-react';

import { facilityService, type Facility } from '../../../services/facility.service';
import { floorService, type Floor } from '../../../services/floor.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import { pricingService, type PricingPlan } from '../../../services/pricing.service';

import { PlanTableView } from './components/PlanTableView';
import { PricingFormModal } from './components/PricingFormModal';
import { PricingDetailModal } from './components/PricingDetailModal';
import { PricingFilterBar } from './components/PricingFilterBar';
import { PricingPagination } from './components/PricingPagination';
import { FacilityFilterBar } from '../facilities/components/FacilityFilterBar';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | undefined>();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<PricingPlan | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFacility, setFilterFacility] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Facilities list filters
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityStatusFilter, setFacilityStatusFilter] = useState('all');
  const [facilityViewMode, setFacilityViewMode] = useState<'grid' | 'list'>('grid');

  const pageLimit = 9;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterFacility, facilitySearch, facilityStatusFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, fRes, vtRes, flRes] = await Promise.all([
        pricingService.getAll({ limit: 100 }),
        facilityService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
        floorService.getAll({ limit: 100 }),
      ]);
      setPlans(pRes.data);
      setFacilities(fRes.data);
      setVehicleTypes(vtRes.data);
      setFloors(flRes.data);
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const displayed = plans.filter((p) => {
    const facId = typeof p.facilityId === 'object' ? p.facilityId._id : p.facilityId;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    
    // If a facility is selected, only show its plans
    if (selectedFacility) {
      if (facId !== selectedFacility._id) return false;
    } else {
      if (filterFacility !== 'all' && facId !== filterFacility) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(displayed.length / pageLimit);
  const paginatedPlans = displayed.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

  // Filter facilities
  const filteredFacilities = facilities.filter(fac => {
    if (facilityStatusFilter !== 'all' && fac.status !== facilityStatusFilter) return false;
    if (facilitySearch.trim()) {
      const q = facilitySearch.toLowerCase();
      if (!fac.name.toLowerCase().includes(q) && !fac.address.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Pagination for facilities
  const totalFacilitiesPages = Math.ceil(filteredFacilities.length / pageLimit);
  const paginatedFacilities = filteredFacilities.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

  // Stats for facilities list
  const getFacilityPlanCount = (facId: string) => plans.filter(p => {
    const pFacId = typeof p.facilityId === 'object' ? p.facilityId._id : p.facilityId;
    return pFacId === facId;
  }).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {selectedFacility && (
            <button
              onClick={() => setSelectedFacility(null)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              title="Quay lại danh sách tòa nhà"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#060606]">
              {selectedFacility ? `Bảng Giá: ${selectedFacility.name}` : 'Bảng Giá'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {selectedFacility ? 'Quản lý các bảng giá của tòa nhà này' : 'Chọn một tòa nhà để xem bảng giá'}
            </p>
          </div>
        </div>
        
        {selectedFacility && (
          <button
            onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
            className="bg-[#d7ee46] text-[#060606] font-bold px-5 py-2.5 rounded-xl hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} /> Thêm Bảng Giá
          </button>
        )}
      </div>

      {selectedFacility && (
        <PricingFilterBar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterFacility={filterFacility}
          setFilterFacility={setFilterFacility}
          facilities={facilities}
          hideFacilityFilter={true}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-44 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !selectedFacility ? (
        <div className="space-y-6">
          <FacilityFilterBar
            search={facilitySearch}
            setSearch={setFacilitySearch}
            statusFilter={facilityStatusFilter}
            setStatusFilter={setFacilityStatusFilter}
            viewMode={facilityViewMode}
            setViewMode={setFacilityViewMode}
            hideViewMode={true}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedFacilities.map((fac) => {
              const isActive = fac.status === 'active';
              const badgeStyle = isActive
                ? { background: '#ECFDF5', color: '#047857', border: '1px solid #D1FAE5' }
                : { background: '#f0f1f0', color: '#6b6e6b', border: '1px solid #e2e3e2' };

              return (
                <motion.div
                  key={fac._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group bg-white rounded-[16px] flex flex-col justify-between overflow-hidden ${!isActive ? 'opacity-70' : ''}`}
                  style={{
                    border: '1.5px solid #e2e3e2',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                    minHeight: 180,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#cce242'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e3e2'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                >
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex gap-3 mb-4">
                      {/* Icon */}
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(204,226,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={24} style={{ color: '#4a7c20' }} strokeWidth={1.5} />
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-[15px] font-semibold text-[#060606] truncate" title={fac.name}>{fac.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[13px]" style={{ color: '#6b6e6b' }}>
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate uppercase tracking-wide" title={fac.address}>{fac.address}</span>
                        </div>
                      </div>
                      {/* Badge */}
                      <div className="flex-shrink-0">
                        <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, ...badgeStyle }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10b981' : '#9b9e9b' }} />
                          {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ TẮT'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 text-gray-700 rounded-lg text-[13px] font-medium border border-gray-200">
                        <FileText size={14} className="text-gray-500" />
                        {getFacilityPlanCount(fac._id)} Bảng Giá
                      </span>
                    </div>
                  </div>
                  
                  {/* View Pricing button */}
                  <div className="px-5 py-3 mt-auto" style={{ borderTop: '1px solid #f0f1f0' }}>
                    <button
                      onClick={() => { setSelectedFacility(fac); setCurrentPage(1); }}
                      className="w-full py-[10px] px-5 rounded-[10px] text-[#060606] text-[14px] flex items-center justify-center gap-[6px] transition-all duration-200 bg-white group-hover:bg-[#cce242] border-[1.5px] border-[#c8d4b8] group-hover:border-[#cce242] font-medium group-hover:font-semibold cursor-pointer"
                    >
                      <FileText size={13} style={{ color: '#4a7c20' }} /> Xem bảng giá &rarr;
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filteredFacilities.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                Không tìm thấy tòa nhà nào.
              </div>
            )}
          </div>
          
          {filteredFacilities.length > 0 && (
            <PricingPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalFacilitiesPages}
              totalItems={filteredFacilities.length}
              pageLimit={pageLimit}
              itemLabel="tòa nhà"
            />
          )}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Tòa nhà này chưa có bảng giá nào.</p>
          <button onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
            className="mt-4 bg-[#d7ee46] text-[#060606] font-bold px-5 py-2.5 rounded-xl border border-[#c4dc32] hover:bg-[#c4dc32] transition-colors inline-flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Tạo bảng giá đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <PlanTableView
            plans={paginatedPlans}
            facilities={facilities}
            vehicleTypes={vehicleTypes}
            onEdit={(p) => { setEditingPlan(p); setModalOpen(true); }}
            onViewDetail={(p) => { setViewingPlan(p); setDetailModalOpen(true); }}
            onRefresh={fetchAll}
          />

          <PricingPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={displayed.length}
            pageLimit={pageLimit}
            itemLabel="bảng giá"
          />
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (() => {
          // Compute allowed vehicle types for the selected facility (if any)
          let allowedVehicleTypes = vehicleTypes;
          if (selectedFacility) {
            const facilityFloors = floors.filter(f => f.facilityId === selectedFacility._id);
            const vtIds = new Set<string>();
            facilityFloors.forEach(fl => {
              fl.allowedVehicleTypes?.forEach((vt: any) => {
                vtIds.add(typeof vt === 'string' ? vt : vt._id);
              });
            });
            allowedVehicleTypes = Array.from(vtIds).map(id => vehicleTypes.find(v => v._id === id)).filter(Boolean) as VehicleType[];
          }
          
          return (
            <PricingFormModal
              plan={editingPlan}
              facilities={facilities}
              vehicleTypes={allowedVehicleTypes}
              onClose={() => setModalOpen(false)}
              onSuccess={fetchAll}
              selectedFacilityId={selectedFacility?._id}
            />
          );
        })()}
        
        {detailModalOpen && (
          <PricingDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            plan={viewingPlan}
            facilities={facilities}
            vehicleTypes={vehicleTypes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
