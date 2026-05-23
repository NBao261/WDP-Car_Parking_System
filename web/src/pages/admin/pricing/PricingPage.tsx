import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, DollarSign, CheckCircle2, XCircle, LayoutGrid, Building2, ChevronDown } from 'lucide-react';

import { facilityService, type Facility } from '../../../services/facility.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import { pricingService, type PricingPlan } from '../../../services/pricing.service';

import { PlanCard } from './components/PlanCard';
import { PricingFormModal } from './components/PricingFormModal';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFacility, setFilterFacility] = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, fRes, vtRes] = await Promise.all([
        pricingService.getAll({ limit: 100 }),
        facilityService.getAll({ limit: 100 }),
        vehicleTypeService.getAll({ limit: 100 }),
      ]);
      setPlans(pRes.data);
      setFacilities(fRes.data);
      setVehicleTypes(vtRes.data);
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
    if (filterFacility !== 'all' && facId !== filterFacility) return false;
    return true;
  });

  const activeCount   = plans.filter(p => p.status === 'active').length;
  const inactiveCount = plans.filter(p => p.status === 'inactive').length;

  const statusTabs = [
    { key: 'all'      as const, label: 'Tất cả',    Icon: LayoutGrid,   count: plans.length },
    { key: 'active'   as const, label: 'Hoạt động', Icon: CheckCircle2, count: activeCount   },
    { key: 'inactive' as const, label: 'Đã tắt',     Icon: XCircle,      count: inactiveCount },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Bảng Giá</h1>
          <p className="text-gray-500 text-sm">Quản lý chính sách giá giữ xe</p>
        </div>
        <button
          onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
          className="bg-[#d7ee46] text-[#060606] font-bold px-5 py-2.5 rounded-xl border border-[#c4dc32] hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Thêm Bảng Giá
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-100 pb-0">

        {/* Status underline tabs */}
        <div className="flex items-center gap-0">
          {statusTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                filterStatus === key
                  ? 'text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none transition-colors ${
                filterStatus === key
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {count}
              </span>
              {/* Active indicator */}
              {filterStatus === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Facility select */}
        <div className="relative flex items-center">
          <Building2 size={14} className="pointer-events-none absolute left-2.5 text-gray-400" />
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-6 text-sm text-gray-600 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">Tất cả cơ sở</option>
            {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2 text-gray-400" />
        </div>

        {/* Count */}
        <span className="text-xs text-gray-400 whitespace-nowrap">
          <b className="text-gray-600 font-semibold">{displayed.length}</b> bảng giá
        </span>

      </div>


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
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Không tìm thấy bảng giá nào.</p>
          <button onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
            className="mt-4 bg-[#d7ee46] text-[#060606] font-bold px-5 py-2.5 rounded-xl border border-[#c4dc32] hover:bg-[#c4dc32] transition-colors inline-flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Tạo bảng giá đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              facilities={facilities}
              vehicleTypes={vehicleTypes}
              onEdit={(p) => { setEditingPlan(p); setModalOpen(true); }}
              onRefresh={fetchAll}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <PricingFormModal
            plan={editingPlan}
            facilities={facilities}
            vehicleTypes={vehicleTypes}
            onClose={() => setModalOpen(false)}
            onSuccess={fetchAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
