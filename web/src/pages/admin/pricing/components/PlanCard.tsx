import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Edit, PowerOff, CheckCircle2, Trash2, MoreVertical, Car, Moon, Clock, CreditCard, ShieldCheck, TrendingUp, Eye } from 'lucide-react';
import { pricingService, type PricingPlan } from '../../../../services/pricing.service';
import { type Facility } from '../../../../services/facility.service';
import { type VehicleType } from '../../../../services/vehicleType.service';
import { FEE_TYPE_LABELS, mapToUiType } from './constants';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';
import { ConfirmModal } from '../../../../components/ConfirmModal';

interface PlanCardProps {
  plan: PricingPlan;
  facilities: Facility[];
  vehicleTypes: VehicleType[];
  onEdit: (p: PricingPlan) => void;
  onViewDetail: (p: PricingPlan) => void;
  onRefresh: () => void;
}

export function PlanCard({ plan, facilities, vehicleTypes, onEdit, onViewDetail, onRefresh }: PlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

  const FEE_TYPE_BADGE: Record<string, string> = {
    per_turn: 'bg-violet-100 text-violet-700',
    hourly: 'bg-sky-100 text-sky-700',
    time_window: 'bg-amber-100 text-amber-700',
  };

  const translateUnit = (unit: string) => {
    const map: Record<string, string> = {
      hour: 'giờ', '/hour': '/giờ', 'hours': 'giờ',
      turn: 'lượt', '/turn': '/lượt',
      day: 'ngày', '/day': '/ngày',
      'VND': 'đ', '/VND': '',
    };
    return map[unit] ?? map[unit.toLowerCase()] ?? unit;
  };

  const translateLabel = (label: string) => {
    const map: Record<string, string> = {
      'First hour': 'Giờ đầu',
      'first hour': 'Giờ đầu',
      'Next hours': 'Giờ tiếp theo',
      'next hours': 'Giờ tiếp theo',
      'Per turn': 'Mỗi lượt',
      'per turn': 'Mỗi lượt',
      'Daily': 'Theo ngày',
      'daily': 'Theo ngày',
      'Flat rate': 'Giá cố định',
    };
    return map[label] ?? label;
  };

  const vtId = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?._id : plan.vehicleTypeId;
  const facId = typeof plan.facilityId === 'object' ? plan.facilityId?._id : plan.facilityId;
  const vtName = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?.name : vehicleTypes.find(v => v._id === vtId)?.name ?? '';
  const vtIconKey = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?.icon : vehicleTypes.find(v => v._id === vtId)?.icon ?? '';
  const facName = typeof plan.facilityId === 'object' ? plan.facilityId?.name : facilities.find(f => f._id === facId)?.name ?? '';
  const facility = facilities.find(f => f._id === facId);

  const uiFeeType = mapToUiType(plan.feeType, plan.feeMethod || '');

  const VtIcon = (vtIconKey && ICON_MAP[vtIconKey]) ? ICON_MAP[vtIconKey] : Car;
  const isActive = plan.status === 'active';
  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  const badgeStyle = isActive
    ? { background: '#ECFDF5', color: '#047857', border: '1px solid #D1FAE5', fontWeight: 600 }
    : { background: '#f0f1f0', color: '#6b6e6b', border: '1px solid #e2e3e2', fontWeight: 600 };

  const toggle = async (s: 'active' | 'inactive') => {
    setMenuOpen(false); setLoading(true);
    try {
      await pricingService.update(plan._id, { status: s });
      toast.success(s === 'active' ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Lỗi'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await pricingService.delete(plan._id);
      toast.success('Đã xóa bảng giá thành công');
      onRefresh();
    } catch (e: any) { toast.error(e.message || 'Lỗi'); }
    finally { setLoading(false); setShowConfirmDelete(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={!isActive ? 'opacity-70 p-5 flex flex-col gap-3 cursor-pointer' : 'p-5 flex flex-col gap-3 cursor-pointer'}
      onClick={() => onViewDetail(plan)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        border: hovered ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Row 1: icon + name + menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 items-center min-w-0 flex-1">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(204,226,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <VtIcon size={22} style={{ color: '#4a7c20' }} strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#060606] text-[17px] leading-snug truncate" title={plan.name}>{plan.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, ...badgeStyle }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10b981' : '#9b9e9b' }} />
            {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ VÔ HIỆU HÓA'}
          </span>

          {loading ? <Loader2 size={16} className="animate-spin text-gray-400 ml-1" /> : (
            <div className="relative ml-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
                    className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30"
                  >
                    <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                    <button onClick={() => { onViewDetail(plan); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Eye size={13} /> Xem chi tiết
                    </button>
                    <button onClick={() => { onEdit(plan); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Edit size={13} /> Chỉnh sửa
                    </button>
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    {isActive
                      ? <button onClick={() => toggle('inactive')} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                        <PowerOff size={13} /> Vô hiệu hóa
                      </button>
                      : <button onClick={() => toggle('active')} className="w-full text-left px-4 py-2 text-sm text-[#060606] hover:bg-[#d7ee46]/10 flex items-center gap-2">
                        <CheckCircle2 size={13} /> Kích hoạt
                      </button>
                    }
                    <div className="h-px bg-gray-100 mx-2 my-1" />
                    <button onClick={() => { setMenuOpen(false); setShowConfirmDelete(true); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={13} /> Xóa
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-50" />

      {/* Row 2: vehicle type + fee type + method */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
        <span className="px-2.5 py-1 bg-[#f4f9ea] text-[#4a7c20] border border-[#e2edce] text-[12px] font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
          <VtIcon size={14} className="text-[#4a7c20]" strokeWidth={2} /> {vtName}
        </span>
        <span className={`font-semibold px-2.5 py-1 border rounded-lg text-[12px] shadow-sm ${FEE_TYPE_BADGE[uiFeeType]?.replace('bg-', 'bg-opacity-50 bg-').replace('text-', 'border-opacity-30 border-').replace('text-', 'text-') ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          {FEE_TYPE_LABELS[uiFeeType] ?? plan.feeType}
        </span>
        {facility && facility.openTime && facility.closeTime && (
          <span className="font-semibold px-2.5 py-1 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-[12px] flex items-center gap-1.5 shadow-sm">
            <Clock size={12} className="text-gray-500" />
            {facility.openTime} - {facility.closeTime}
          </span>
        )}
      </div>

      {/* Row 3: Rates display */}
      <div className="mt-2 space-y-2">
        {plan.rates.map((rate, idx) => (
          <div key={idx} className="flex justify-between items-center text-[15px] border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <span className="text-gray-600 font-medium">
              {rate.startTime && rate.endTime ? (
                <span className="text-[#060606] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-[12px] mr-2 tracking-wide font-semibold">
                  {rate.startTime} - {rate.endTime}
                </span>
              ) : null}
              {translateLabel(rate.label)}
              {(idx === 0 && plan.feeMethod === 'duration_based' && plan.firstBlockHours && plan.firstBlockHours > 1) && ` (${plan.firstBlockHours}h)`}
            </span>
            <span className="font-bold text-[#4a7c20]">
              {fmt(rate.amount)}<span className="text-[13px] font-normal text-gray-500 ml-1">/{translateUnit(rate.unit)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Row 4: Surcharges (only if any) */}
      {(plan.overnightFee > 0 || plan.overtimeFeePerHour > 0 || plan.lostCardFee > 0 || (plan.gracePeriodMinutes && plan.gracePeriodMinutes > 0) || (plan.maxDailyFee && plan.maxDailyFee > 0)) && (
        <div className="flex flex-wrap gap-2 pt-3 mt-1 border-t border-gray-50">
          {plan.gracePeriodMinutes ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={12} /> Miễn {plan.gracePeriodMinutes}p đầu
            </span>
          ) : null}
          {plan.maxDailyFee ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg">
              <TrendingUp size={12} /> Trần {fmt(plan.maxDailyFee)}/ngày
            </span>
          ) : null}
          {plan.overnightFee > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[12px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg">
              <Moon size={12} /> Qua đêm {fmt(plan.overnightFee)}
            </span>
          )}
          {plan.overtimeFeePerHour > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[12px] bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-lg">
              <Clock size={12} /> Quá giờ {fmt(plan.overtimeFeePerHour)}/h
            </span>
          )}
          {plan.lostCardFee > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[12px] bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-lg">
              <CreditCard size={12} /> Mất thẻ {fmt(plan.lostCardFee)}
            </span>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bảng giá "${plan.name}" không?`}
        confirmText="Xóa bảng giá"
        cancelText="Hủy"
        variant="danger"
        isLoading={loading}
      />
    </motion.div>
  );
}
