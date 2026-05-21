import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, DollarSign } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Bảng Giá</h1>
          <p className="text-gray-500 text-sm">Quản lý chính sách giá giữ xe (FR-5)</p>
        </div>
        <button
          onClick={() => { setEditingPlan(undefined); setModalOpen(true); }}
          className="bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Thêm Bảng Giá
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-[#060606] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
              {s === 'all' ? 'Tất cả' : s === 'active' ? 'Hoạt động' : 'Đã tắt'}
            </button>
          ))}
        </div>
        <select value={filterFacility} onChange={(e) => setFilterFacility(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d7ee46]">
          <option value="all">Tất cả cơ sở</option>
          {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{displayed.length} bảng giá</span>
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
            className="mt-4 bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors inline-flex items-center gap-2">
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
