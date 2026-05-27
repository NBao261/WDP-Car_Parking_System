import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Edit, PowerOff, CheckCircle2, Trash2, MoreVertical, Car, Moon, Clock, CreditCard } from 'lucide-react';
import { pricingService, type PricingPlan } from '../../../../services/pricing.service';
import { type Facility } from '../../../../services/facility.service';
import { type VehicleType } from '../../../../services/vehicleType.service';
import { FEE_TYPE_LABELS } from './constants';
import { ICON_MAP } from '../../vehicles/components/constants';
import { ConfirmModal } from '../../../../components/ConfirmModal';

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

  /** Màu badge theo loại phí */
  const FEE_TYPE_BADGE: Record<string, string> = {
    per_turn: 'bg-violet-100 text-violet-700',
    hourly: 'bg-sky-100 text-sky-700',
    daily: 'bg-amber-100 text-amber-700',
    monthly: 'bg-[#d7ee46]/20 text-[#060606]',
  };

  /** Dịch đơn vị sang tiếng Việt */
  const translateUnit = (unit: string) => {
    const map: Record<string, string> = {
      hour: 'giờ', '/hour': '/giờ', 'hours': 'giờ',
      turn: 'lượt', '/turn': '/lượt',
      day: 'ngày', '/day': '/ngày',
      month: 'tháng', '/month': '/tháng',
      'VND': 'đ', '/VND': '',
    };
    return map[unit] ?? map[unit.toLowerCase()] ?? unit;
  };

  /** Dịch nhãn mức giá sang tiếng Việt */
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
      'Monthly': 'Theo tháng',
      'monthly': 'Theo tháng',
      'Flat rate': 'Giá cố định',
    };
    return map[label] ?? label;
  };

  const vtId = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?._id : plan.vehicleTypeId;
  const facId = typeof plan.facilityId === 'object' ? plan.facilityId?._id : plan.facilityId;
  const vtName = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?.name : vehicleTypes.find(v => v._id === vtId)?.name ?? '';
  const vtIconKey = typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?.icon : vehicleTypes.find(v => v._id === vtId)?.icon ?? '';
  const facName = typeof plan.facilityId === 'object' ? plan.facilityId?.name : facilities.find(f => f._id === facId)?.name ?? '';

  const VtIcon = (vtIconKey && ICON_MAP[vtIconKey]) ? ICON_MAP[vtIconKey] : Car;
  const isActive = plan.status === 'active';
  const mainRate = plan.rates[0];
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
      await pricingService.deactivate(plan._id);
      toast.success('Đã xóa');
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
      className={!isActive ? 'opacity-70 p-5 flex flex-col gap-3' : 'p-5 flex flex-col gap-3'}
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
      <div className="flex items-start gap-3">
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(204,226,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <VtIcon size={22} style={{ color: '#4a7c20' }} strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-snug truncate">{plan.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{facName}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Status dot and text */}
          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5, ...badgeStyle }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10b981' : '#9b9e9b' }} />
            {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ TẮT'}
          </span>

          {/* Menu */}
          {loading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : (
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={15} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30"
                  >
                    <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                    <button onClick={() => { onEdit(plan); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
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

      {/* Divider */}
      <div className="h-px bg-gray-50" />

      {/* Row 2: vehicle type + fee type */}
      <div className="flex items-center justify-between text-xs">
        <span className="px-2.5 py-1.5 bg-[#f4f9ea] text-[#4a7c20] border border-[#e2edce] text-[11px] font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
          <VtIcon size={13} className="text-[#4a7c20]" strokeWidth={2} /> {vtName}
        </span>
        <span className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${FEE_TYPE_BADGE[plan.feeType] ?? 'bg-gray-100 text-gray-600'}`}>
          {FEE_TYPE_LABELS[plan.feeType]}
        </span>
      </div>

      {/* Row 3: price */}
      {mainRate && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{translateLabel(mainRate.label)}</p>
          <p className="text-lg font-bold text-gray-800">
            {fmt(mainRate.amount)}
            <span className="text-xs font-normal text-gray-400 ml-1">/{translateUnit(mainRate.unit)}</span>
            {plan.rates.length > 1 && (
              <span className="text-[11px] text-gray-400 font-normal ml-2">+{plan.rates.length - 1} mức</span>
            )}
          </p>
        </div>
      )}

      {/* Row 4: surcharges (only if any) */}
      {(plan.overnightFee > 0 || plan.overtimeFeePerHour > 0 || plan.lostCardFee > 0) && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50">
          {plan.overnightFee > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
              <Moon size={9} /> {fmt(plan.overnightFee)}
            </span>
          )}
          {plan.overtimeFeePerHour > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-lg">
              <Clock size={9} /> {fmt(plan.overtimeFeePerHour)}/h
            </span>
          )}
          {plan.lostCardFee > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-lg">
              <CreditCard size={9} /> {fmt(plan.lostCardFee)}
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
