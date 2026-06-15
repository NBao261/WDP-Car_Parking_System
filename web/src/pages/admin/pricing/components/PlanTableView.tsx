import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, PowerOff, CheckCircle2, Trash2, Car, MoreVertical } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { pricingService, type PricingPlan } from '../../../../services/pricing.service';
import { type Facility } from '../../../../services/facility.service';
import { type VehicleType } from '../../../../services/vehicleType.service';
import { FEE_TYPE_LABELS, mapToUiType } from './constants';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';
import { ConfirmModal } from '../../../../components/ConfirmModal';

interface PlanTableProps {
  plans: PricingPlan[];
  facilities: Facility[];
  vehicleTypes: VehicleType[];
  onEdit: (p: PricingPlan) => void;
  onViewDetail: (p: PricingPlan) => void;
  onRefresh: () => void;
}

export function PlanTableView({
  plans,
  facilities,
  vehicleTypes,
  onEdit,
  onViewDetail,
  onRefresh,
}: PlanTableProps) {
  const [loading, setLoading] = useState(false);
  const [deletePlan, setDeletePlan] = useState<PricingPlan | null>(null);
  const [menuState, setMenuState] = useState<{ id: string; top: number; right: number } | null>(
    null
  );

  const handleMenuClick = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (menuState?.id === planId) {
      setMenuState(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      id: planId,
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    });
  };

  // Close menu on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = () => setMenuState(null);
    const handleScroll = () => setMenuState(null);
    if (menuState) {
      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuState]);

  const toggle = async (plan: PricingPlan, s: 'active' | 'inactive') => {
    setLoading(true);
    try {
      await pricingService.update(plan._id, { status: s });
      toast.success(s === 'active' ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;
    setLoading(true);
    try {
      await pricingService.delete(deletePlan._id);
      toast.success('Đã xóa bảng giá thành công');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi');
    } finally {
      setLoading(false);
      setDeletePlan(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';
  const translateUnit = (unit: string) => {
    const map: Record<string, string> = {
      hour: 'giờ',
      '/hour': '/giờ',
      hours: 'giờ',
      turn: 'lượt',
      '/turn': '/lượt',
      day: 'ngày',
      '/day': '/ngày',
      VND: 'đ',
      '/VND': '',
    };
    return map[unit] ?? map[unit.toLowerCase()] ?? unit;
  };

  const activeMenuPlan = plans.find((p) => p._id === menuState?.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col relative">
      <div className="w-full overflow-x-auto min-h-[160px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-lime-50/50 text-lime-700 font-semibold border-b border-lime-100/50">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Tên bảng giá</th>
              <th className="px-6 py-4">Loại xe</th>
              <th className="px-6 py-4">Loại giá</th>
              <th className="px-6 py-4">Đơn giá cơ bản</th>
              <th className="px-6 py-4">Phụ phí</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {plans.map((plan) => {
              const vtId =
                typeof plan.vehicleTypeId === 'object'
                  ? plan.vehicleTypeId?._id
                  : plan.vehicleTypeId;
              const vtName =
                typeof plan.vehicleTypeId === 'object'
                  ? plan.vehicleTypeId?.name
                  : (vehicleTypes.find((v) => v._id === vtId)?.name ?? '');
              const vtIconKey =
                typeof plan.vehicleTypeId === 'object'
                  ? plan.vehicleTypeId?.icon
                  : (vehicleTypes.find((v) => v._id === vtId)?.icon ?? '');
              const uiFeeType = mapToUiType(plan.feeType, plan.feeMethod || '');
              const VtIcon = vtIconKey && ICON_MAP[vtIconKey] ? ICON_MAP[vtIconKey] : Car;
              const isActive = plan.status === 'active';

              const baseRate = plan.rates[0];

              return (
                <tr
                  key={plan._id}
                  onClick={() => onViewDetail(plan)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${!isActive ? 'opacity-75 bg-gray-50/50' : ''}`}
                >
                  <td
                    className="px-6 py-4 font-bold text-[14px] text-[#060606] max-w-[200px] truncate"
                    title={plan.name}
                  >
                    {plan.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f4f9ea] text-[#4a7c20] border border-[#e2edce] text-[12px] font-semibold rounded-lg">
                      <VtIcon size={14} className="text-[#4a7c20]" strokeWidth={2} /> {vtName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 font-medium">
                      {FEE_TYPE_LABELS[uiFeeType] ?? plan.feeType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {baseRate ? (
                      <div className="whitespace-nowrap">
                        <span className="font-bold text-[#4a7c20] text-[14px]">
                          {fmt(baseRate.amount)}
                        </span>
                        <span className="text-gray-500 text-xs ml-1">
                          /{translateUnit(baseRate.unit)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                      {plan.overnightFee > 0 && (
                        <span>
                          Qua đêm:{' '}
                          <span className="font-medium text-gray-700">
                            {fmt(plan.overnightFee)}
                          </span>
                        </span>
                      )}
                      {plan.overtimeFeePerHour > 0 && (
                        <span>
                          Quá giờ:{' '}
                          <span className="font-medium text-gray-700">
                            {fmt(plan.overtimeFeePerHour)}/h
                          </span>
                        </span>
                      )}
                      {plan.lostCardFee > 0 && (
                        <span>
                          Mất thẻ:{' '}
                          <span className="font-medium text-gray-700">{fmt(plan.lostCardFee)}</span>
                        </span>
                      )}
                      {!plan.overnightFee && !plan.overtimeFeePerHour && !plan.lostCardFee && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
                    >
                      {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ VÔ HIỆU HÓA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleMenuClick(e, plan._id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bảng giá "${deletePlan?.name}" không?`}
        confirmText="Xóa bảng giá"
        cancelText="Hủy"
        variant="danger"
        isLoading={loading}
      />

      {menuState &&
        activeMenuPlan &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: menuState.top,
              right: menuState.right,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-40 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5"
            >
              <button
                onClick={() => {
                  onEdit(activeMenuPlan);
                  setMenuState(null);
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit size={14} /> Chỉnh sửa
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              {activeMenuPlan.status === 'active' ? (
                <button
                  onClick={() => {
                    toggle(activeMenuPlan, 'inactive');
                    setMenuState(null);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                >
                  <PowerOff size={14} /> Vô hiệu hóa
                </button>
              ) : (
                <button
                  onClick={() => {
                    toggle(activeMenuPlan, 'active');
                    setMenuState(null);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> Kích hoạt
                </button>
              )}
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button
                onClick={() => {
                  setDeletePlan(activeMenuPlan);
                  setMenuState(null);
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
