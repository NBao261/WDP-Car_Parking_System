import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, DollarSign, Building2, MapPin, ArrowLeft, FileText, Clock, Layers } from 'lucide-react';

import { facilityService, type Facility } from '../../../services/facility.service';
import { floorService, type Floor } from '../../../services/floor.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import { pricingService, type PricingPlan } from '../../../services/pricing.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { AssignedFacility } from '../../../types/user.types';

import { PlanTableView } from './components/PlanTableView';
import { PricingFormModal } from './components/PricingFormModal';
import { PricingDetailModal } from './components/PricingDetailModal';
import { PricingFilterBar } from './components/PricingFilterBar';
import { PricingPagination } from './components/PricingPagination';
import { PricingFacilityFilterBar } from './components/PricingFacilityFilterBar';
import { mapToUiType } from './components/constants';

export default function PricingPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';
  const assignedFacilityIds = useMemo(() => {
    if (!isManager || !user?.assignedFacilities) return null;
    return new Set(
      (user.assignedFacilities as AssignedFacility[]).map((f) => f._id)
    );
  }, [isManager, user?.assignedFacilities]);

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

  // Plans list filters
  const [planSearch, setPlanSearch] = useState('');
  const [planFilterVehicleType, setPlanFilterVehicleType] = useState('all');
  const [planFilterFeeType, setPlanFilterFeeType] = useState('all');
  const [planSortName, setPlanSortName] = useState('default');
  const [planSortVehicle, setPlanSortVehicle] = useState('default');
  const [planSortPrice, setPlanSortPrice] = useState('default');
  const [planSortDate, setPlanSortDate] = useState('default');

  // Facilities list filters
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityStatusFilter, setFacilityStatusFilter] = useState('all');
  const [facilityViewMode, setFacilityViewMode] = useState<'grid' | 'list'>('grid');
  const [facilitySort, setFacilitySort] = useState('default');

  const pageLimit = 9;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterStatus,
    filterFacility,
    planSearch,
    planFilterVehicleType,
    planFilterFeeType,
    planSortName,
    planSortVehicle,
    planSortPrice,
    planSortDate,
    facilitySearch,
    facilityStatusFilter,
    facilitySort,
  ]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, fRes, vtRes, flRes] = await Promise.all([
        pricingService.getAll({ limit: 100 }),
        facilityService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
        floorService.getAll({ limit: 100 }),
      ]);

      // Manager: chỉ hiển thị dữ liệu thuộc tòa nhà được phân công
      const scopedFacilities = assignedFacilityIds
        ? fRes.data.filter((f: Facility) => assignedFacilityIds.has(f._id))
        : fRes.data;
      const scopedFacilityIds = new Set(scopedFacilities.map((f: Facility) => f._id));
      const scopedPlans = assignedFacilityIds
        ? pRes.data.filter((p: PricingPlan) => {
          const facId =
            p.facilityId && typeof p.facilityId === 'object' ? p.facilityId._id : p.facilityId;
          return scopedFacilityIds.has(facId);
        })
        : pRes.data;
      const scopedFloors = assignedFacilityIds
        ? flRes.data.filter((fl: Floor) => scopedFacilityIds.has(fl.facilityId))
        : flRes.data;

      setPlans(scopedPlans);
      setFacilities(scopedFacilities);
      setVehicleTypes(vtRes.data);
      setFloors(scopedFloors);
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [assignedFacilityIds]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const availableVehicleTypes = useMemo(() => {
    if (!selectedFacility) return vehicleTypes;
    // Lấy loại xe từ allowedVehicleTypes của các tầng thuộc tòa nhà
    const facilityFloors = floors.filter((f) => f.facilityId === selectedFacility._id);
    const vtIds = new Set<string>();
    facilityFloors.forEach((fl) => {
      fl.allowedVehicleTypes?.forEach((vt: any) => {
        vtIds.add(typeof vt === 'string' ? vt : vt._id);
      });
    });
    return vehicleTypes.filter((vt) => vtIds.has(vt._id));
  }, [selectedFacility, floors, vehicleTypes]);

  const displayed = plans.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;

    if (planSearch.trim()) {
      const q = planSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q)) return false;
    }

    if (planFilterVehicleType !== 'all') {
      const vtId =
        typeof p.vehicleTypeId === 'object' && p.vehicleTypeId
          ? p.vehicleTypeId._id
          : p.vehicleTypeId;
      if (vtId !== planFilterVehicleType) return false;
    }

    if (planFilterFeeType !== 'all') {
      const uiType = mapToUiType(p.feeType, p.feeMethod || '');
      if (uiType !== planFilterFeeType) return false;
    }

    const facId =
      typeof p.facilityId === 'object' && p.facilityId ? p.facilityId._id : p.facilityId;

    // If a facility is selected, only show its plans
    if (selectedFacility) {
      if (facId !== selectedFacility._id) return false;
    } else {
      if (filterFacility !== 'all' && facId !== filterFacility) return false;
    }

    return true;
  });

  const sortedPlans = [...displayed].sort((a, b) => {
    if (planSortName !== 'default') {
      const cmp = a.name.localeCompare(b.name, 'vi');
      return planSortName === 'name_asc' ? cmp : -cmp;
    }
    if (planSortVehicle !== 'default') {
      const vtNameA = typeof a.vehicleTypeId === 'object' ? a.vehicleTypeId?.name || '' : (vehicleTypes.find(v => v._id === a.vehicleTypeId)?.name || '');
      const vtNameB = typeof b.vehicleTypeId === 'object' ? b.vehicleTypeId?.name || '' : (vehicleTypes.find(v => v._id === b.vehicleTypeId)?.name || '');
      const cmp = vtNameA.localeCompare(vtNameB, 'vi');
      return planSortVehicle === 'vt_asc' ? cmp : -cmp;
    }
    if (planSortPrice !== 'default') {
      const priceA = a.rates && a.rates.length > 0 ? a.rates[0].amount : 0;
      const priceB = b.rates && b.rates.length > 0 ? b.rates[0].amount : 0;
      if (planSortPrice === 'price_desc') return priceB - priceA;
      if (planSortPrice === 'price_asc') return priceA - priceB;
    }
    if (planSortDate === 'created_desc')
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (planSortDate === 'created_asc')
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const totalPages = Math.ceil(sortedPlans.length / pageLimit);
  const paginatedPlans = sortedPlans.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

  // Stats for facilities list
  const getFacilityPlanCount = useCallback(
    (facId: string) =>
      plans.filter((p) => {
        const pFacId =
          typeof p.facilityId === 'object' && p.facilityId ? p.facilityId._id : p.facilityId;
        return pFacId === facId;
      }).length,
    [plans]
  );

  // Filter facilities
  const filteredFacilities = facilities
    .filter((fac) => {
      if (facilityStatusFilter !== 'all' && fac.status !== facilityStatusFilter) return false;
      if (facilitySearch.trim()) {
        const q = facilitySearch.toLowerCase();
        if (!fac.name.toLowerCase().includes(q) && !fac.address.toLowerCase().includes(q))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (facilitySort === 'planCount_desc') {
        return getFacilityPlanCount(b._id) - getFacilityPlanCount(a._id);
      }
      if (facilitySort === 'planCount_asc') {
        return getFacilityPlanCount(a._id) - getFacilityPlanCount(b._id);
      }
      return 0; // default order
    });

  // Pagination for facilities
  const totalFacilitiesPages = Math.ceil(filteredFacilities.length / pageLimit);
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit
  );

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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-[#062F28]">BẢNG GIÁ</span>
              {selectedFacility && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-[#7B7B7B] uppercase">{selectedFacility.name}</span>
                </>
              )}
            </h1>
            <div className="flex flex-col mt-1">
              {!selectedFacility && (
                <p className="text-gray-500 text-sm">Chọn một tòa nhà để xem bảng giá</p>
              )}
              {selectedFacility?.address && (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <MapPin size={14} className="shrink-0" />
                  <span>{selectedFacility.address}</span>
                </div>
              )}
              {selectedFacility && (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Clock size={14} className="shrink-0" />
                  <span>
                    {selectedFacility.openTime} - {selectedFacility.closeTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedFacility && (
          <button
            onClick={() => {
              setEditingPlan(undefined);
              setModalOpen(true);
            }}
            className="bg-[#062F28] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#062F28]/80 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} /> Thêm Bảng Giá
          </button>
        )}
      </div>

      {selectedFacility && (
        <PricingFilterBar
          filterStatus={filterStatus as any}
          setFilterStatus={setFilterStatus as any}
          filterFacility={filterFacility}
          setFilterFacility={setFilterFacility}
          facilities={facilities}
          hideFacilityFilter={!!selectedFacility}
          search={planSearch}
          setSearch={setPlanSearch}
          filterVehicleType={planFilterVehicleType}
          setFilterVehicleType={setPlanFilterVehicleType}
          vehicleTypes={availableVehicleTypes}
          filterFeeType={planFilterFeeType}
          setFilterFeeType={setPlanFilterFeeType}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-44 space-y-3"
            >
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !selectedFacility ? (
        <div className="space-y-6">
          <PricingFacilityFilterBar
            search={facilitySearch}
            setSearch={setFacilitySearch}
            statusFilter={facilityStatusFilter}
            setStatusFilter={setFacilityStatusFilter}
            viewMode={facilityViewMode}
            setViewMode={setFacilityViewMode}
            hideViewMode={true}
            sortValue={facilitySort}
            onSortChange={setFacilitySort}
            sortOptions={[
              { value: 'default', label: 'Tất cả bảng giá' },
              { value: 'planCount_desc', label: 'Nhiều bảng giá nhất' },
              { value: 'planCount_asc', label: 'Ít bảng giá nhất' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedFacilities.map((fac) => {
              const isActive = fac.status === 'active';
              const badgeStyle = isActive
                ? { background: 'rgba(159,232,112,0.15)', color: '#82C94E', border: 'none', fontWeight: 'bold' }
                : (fac as any).status === 'maintenance'
                  ? { background: 'rgba(250,204,21,0.15)', color: '#EAB308', border: 'none', fontWeight: 'bold' }
                  : { background: '#f0f1f0', color: '#6b6e6b', border: 'none', fontWeight: 'bold' };

              return (
                <motion.div
                  key={fac._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group bg-white rounded-[16px] flex flex-col justify-between overflow-hidden ${!isActive ? 'opacity-70' : ''}`}
                  style={{
                    border: '2px solid #e2e3e2',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                    minHeight: 180,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9FE870';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e3e2';
                  }}
                >
                  <div className="px-5 pt-4 pb-3">
                               <div className="flex items-start gap-4 mb-3">
                      {/* Icon */}
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: '#ffffff',
                          border: '1.5px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={24} style={{ color: '#9FE870' }} />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3
                            className="text-[15px] font-bold text-[#062F28] truncate"
                            title={fac.name}
                          >
                            {fac.name}
                          </h3>
                          <div className="flex-shrink-0">
                            <span
                              style={{
                                fontSize: 10,
                                padding: '3px 10px',
                                borderRadius: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                ...badgeStyle,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: isActive ? '#82C94E' : (fac as any).status === 'maintenance' ? '#EAB308' : '#9b9e9b',
                                }}
                              />
                              {isActive ? 'HOẠT ĐỘNG' : (fac as any).status === 'maintenance' ? 'BẢO TRÌ' : 'ĐÃ VÔ HIỆU HÓA'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-[#7B7B7B]">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate uppercase tracking-wide" title={fac.address}>
                            {fac.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium mb-4">
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} className="text-gray-400 shrink-0" /> {fac.totalFloors || 0} tầng
                      </span>
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Clock size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate" title={`Thời gian hoạt động: ${fac.openTime} - ${fac.closeTime}`}>
                          Thời gian hoạt động: {fac.openTime} - {fac.closeTime}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 text-gray-700 rounded-lg text-[13px] font-medium border border-gray-200">
                        <FileText size={14} className="text-gray-500" />
                        {getFacilityPlanCount(fac._id)} Bảng Giá
                      </span>
                    </div>
                  </div>

                  {/* View Pricing button */}
                  <div className="px-5 pb-5 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedFacility(fac);
                        setCurrentPage(1);
                      }}
                      className={`w-full py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${isActive ? 'bg-[#9FE870] text-[#062F28] hover:bg-[#062F28] hover:text-[#9FE870]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                    >
                      Xem bảng giá &rarr;
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
          <div className="w-16 h-16 bg-white border-[1.5px] border-[#f0f0f0] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign size={28} className="text-[#9FE870]" />
          </div>
          <p className="text-gray-500 font-medium">Tòa nhà này chưa có bảng giá nào.</p>
          <button
            onClick={() => {
              setEditingPlan(undefined);
              setModalOpen(true);
            }}
            className="mt-4 bg-[#062F28] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#062F28]/80 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Tạo bảng giá đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <PlanTableView
            plans={paginatedPlans}
            facilities={facilities}
            vehicleTypes={vehicleTypes}
            onEdit={(p) => {
              setEditingPlan(p);
              setModalOpen(true);
            }}
            onViewDetail={(p) => {
              setViewingPlan(p);
              setDetailModalOpen(true);
            }}
            onRefresh={fetchAll}
            currentPage={currentPage}
            itemsPerPage={pageLimit}
            sortName={planSortName}
            setSortName={setPlanSortName}
            sortVehicle={planSortVehicle}
            setSortVehicle={setPlanSortVehicle}
            sortPrice={planSortPrice}
            setSortPrice={setPlanSortPrice}
            sortDate={planSortDate}
            setSortDate={setPlanSortDate}
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
        {modalOpen &&
          (() => {
            // Compute allowed vehicle types for the selected facility (if any)
            let allowedVehicleTypes = vehicleTypes;
            if (selectedFacility) {
              const facilityFloors = floors.filter((f) => f.facilityId === selectedFacility._id);
              const vtIds = new Set<string>();
              facilityFloors.forEach((fl) => {
                fl.allowedVehicleTypes?.forEach((vt: any) => {
                  vtIds.add(typeof vt === 'string' ? vt : vt._id);
                });
              });
              allowedVehicleTypes = Array.from(vtIds)
                .map((id) => vehicleTypes.find((v) => v._id === id))
                .filter(Boolean) as VehicleType[];
            }

              return (
              <PricingFormModal
                plan={editingPlan}
                facilities={facilities}
                vehicleTypes={allowedVehicleTypes}
                existingPlans={plans}
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
