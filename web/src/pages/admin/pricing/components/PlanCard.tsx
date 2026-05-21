import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Loader2, Edit, PowerOff, CheckCircle, Trash2,
  DollarSign, Tag, MoreVertical,
} from 'lucide-react';
import { pricingService, type PricingPlan } from '../../../../services/pricing.service';
import { type Facility } from '../../../../services/facility.service';
import { type VehicleType } from '../../../../services/vehicleType.service';
import { FEE_TYPE_LABELS } from './constants';

interface PlanCardProps {
  plan: PricingPlan;
  facilities: Facility[];
  vehicleTypes: VehicleType[];
  onEdit: (p: PricingPlan) => void;
  onRefresh: () => void;
}

export function PlanCard({ plan, facilities, vehicleTypes, onEdit, onRefresh }: PlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const vtId = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId._id : plan.vehicleTypeId;
  const facId = (plan.facilityId && typeof plan.facilityId === 'object') ? plan.facilityId._id : plan.facilityId;
  const vtName = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId.name
    : (vehicleTypes.find(v => v._id === vtId)?.name ?? (vtId || ''));
  const vtIcon = (plan.vehicleTypeId && typeof plan.vehicleTypeId === 'object') ? plan.vehicleTypeId.icon
    : (vehicleTypes.find(v => v._id === vtId)?.icon ?? '🚗');
  const facName = (plan.facilityId && typeof plan.facilityId === 'object') ? plan.facilityId.name
    : (facilities.find(f => f._id === facId)?.name ?? (facId || ''));

  const toggle = async (newStatus: 'active' | 'inactive') => {
    setMenuOpen(false); setLoading(true);
    try {
      await pricingService.update(plan._id, { status: newStatus });
      toast.success(newStatus === 'active' ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Xóa bảng giá "${plan.name}"?`)) return;
    setLoading(true);
    try {
      await pricingService.deactivate(plan._id);
      toast.success('Đã xóa bảng giá');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  const mainRate = plan.rates[0];
  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#d7ee46]/20 rounded-xl flex items-center justify-center text-lg">{vtIcon}</div>
          <div>
            <h3 className="font-bold text-[#060606] text-sm leading-tight">{plan.name}</h3>
            <p className="text-xs text-gray-500">{facName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>{plan.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}</span>
          {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                    <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                    <button onClick={() => { onEdit(plan); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Edit size={13} /> Chỉnh sửa
                    </button>
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    {plan.status === 'active'
                      ? <button onClick={() => toggle('inactive')} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"><PowerOff size={13} /> Vô hiệu hóa</button>
                      : <button onClick={() => toggle('active')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"><CheckCircle size={13} /> Kích hoạt</button>}
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={13} /> Xóa
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Tag size={12} className="text-gray-400" /> {vtName} · <span className="font-medium">{FEE_TYPE_LABELS[plan.feeType]}</span>
        </div>
        {mainRate && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <DollarSign size={12} className="text-gray-400" />
            {mainRate.label}: <span className="font-semibold text-[#060606]">{fmt(mainRate.amount)}</span>/{mainRate.unit}
          </div>
        )}
        {plan.rates.length > 1 && (
          <p className="text-[11px] text-gray-400">+{plan.rates.length - 1} mức giá khác</p>
        )}
      </div>

      {/* Surcharges */}
      {(plan.overnightFee > 0 || plan.overtimeFeePerHour > 0 || plan.lostCardFee > 0) && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
          {plan.overnightFee > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">🌙 {fmt(plan.overnightFee)}</span>}
          {plan.overtimeFeePerHour > 0 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">⏱ {fmt(plan.overtimeFeePerHour)}/h</span>}
          {plan.lostCardFee > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">💳 {fmt(plan.lostCardFee)}</span>}
        </div>
      )}
    </motion.div>
  );
}
