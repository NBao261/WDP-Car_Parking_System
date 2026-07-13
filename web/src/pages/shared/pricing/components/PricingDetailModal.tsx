import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  X,
  DollarSign,
  Building2,
  MapPin,
  Calendar,
  Car,
  ShieldCheck,
  Moon,
  CreditCard,
  TrendingUp,
  Info,
  CheckCircle2,
  PowerOff,
  Clock,
} from 'lucide-react';
import { pricingService, PricingPlan } from '../../../../services/pricing.service';
import { Facility } from '../../../../services/facility.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ICON_MAP, getVehicleColorTheme } from '../../../shared/vehicles/components/constants';
import { FEE_TYPE_LABELS, mapToUiType } from './constants';

interface PricingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PricingPlan;
  facilities: Facility[];
  vehicleTypes: VehicleType[];
}

export function PricingDetailModal({
  isOpen,
  onClose,
  plan,
  facilities,
  vehicleTypes,
}: PricingDetailModalProps) {
  if (!isOpen || !plan) return null;

  const isActive = plan.status === 'active';

  // Fetch active session count
  const [sessCount, setSessCount] = useState(0);
  useEffect(() => {
    if (isOpen && plan?._id) {
      pricingService.getActiveSessionCount(plan._id)
        .then(res => setSessCount(res.data.activeSessionCount))
        .catch(() => setSessCount(0));
    }
  }, [isOpen, plan?._id]);

  const vtId =
    typeof plan.vehicleTypeId === 'object' ? plan.vehicleTypeId?._id : plan.vehicleTypeId;
  const facId = typeof plan.facilityId === 'object' ? plan.facilityId?._id : plan.facilityId;
  const vtName =
    typeof plan.vehicleTypeId === 'object'
      ? plan.vehicleTypeId?.name
      : (vehicleTypes.find((v) => v._id === vtId)?.name ?? '');
  const vtIconKey =
    typeof plan.vehicleTypeId === 'object'
      ? plan.vehicleTypeId?.icon
      : (vehicleTypes.find((v) => v._id === vtId)?.icon ?? '');
  const facName =
    typeof plan.facilityId === 'object'
      ? plan.facilityId?.name
      : (facilities.find((f) => f._id === facId)?.name ?? '');
  const facAddress =
    typeof plan.facilityId === 'object'
      ? (plan.facilityId as any).address
      : (facilities.find((f) => f._id === facId)?.address ?? '');

  const uiFeeType = mapToUiType(plan.feeType, plan.feeMethod || '');
  const VtIcon = vtIconKey && ICON_MAP[vtIconKey] ? ICON_MAP[vtIconKey] : Car;
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

  const translateLabel = (label: string) => {
    const map: Record<string, string> = {
      'First hour': 'Giờ đầu',
      'first hour': 'Giờ đầu',
      'Next hours': 'Giờ tiếp theo',
      'next hours': 'Giờ tiếp theo',
      'Per turn': 'Mỗi lượt',
      'per turn': 'Mỗi lượt',
      Daily: 'Theo ngày',
      daily: 'Theo ngày',
      'Flat rate': 'Giá cố định',
    };
    return map[label] ?? label;
  };

  const FEE_TYPE_BADGE: Record<string, string> = {
    per_turn: 'bg-[#9FE870]/15 text-[#062F28]',
    hourly: 'bg-[#9FE870]/15 text-[#062F28]',
    time_window: 'bg-[#9FE870]/15 text-[#062F28]',
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#062F28]">Chi tiết Bảng Giá</h2>
              <p className="text-xs text-gray-500 mt-0.5">Thông tin chi tiết giá và phụ phí</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: General, Building, Vehicle Type, Price Type */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                      Thông tin chung
                    </p>
                    {(() => {
                      if (isActive) {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-[#f0fce4] to-[#e6f9d4] text-[#4a8c1c] border border-[#c2e89a]/60 shadow-sm">
                              <CheckCircle2 size={12} />
                              ĐANG ÁP DỤNG
                            </span>
                            {sessCount > 0 && (
                              <span className="text-[11px] font-medium text-[#4a8c1c]">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#82C94E] animate-pulse mr-1 align-middle" />
                                {sessCount} xe đang gửi
                              </span>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-400 border border-gray-200/60">
                            <PowerOff size={12} />
                            VÔ HIỆU HÓA
                          </span>
                          {sessCount > 0 && (
                            <span className="text-[11px] font-medium text-amber-600">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1 align-middle" />
                              {sessCount} xe · giá cũ
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#ffffff] border-[1.5px] border-[#f0f0f0] flex items-center justify-center shrink-0">
                      <DollarSign size={32} className="text-[#9FE870]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#062F28] mb-1.5">{plan.name}</h3>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                        <Calendar size={13} /> Ngày tạo:{' '}
                        <span className="text-gray-700 font-medium">
                          {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                    <Building2 size={14} /> Tòa nhà áp dụng
                  </p>
                  <div className="w-full bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-800 text-[15px]">{facName}</p>
                    {facAddress && (
                      <p className="text-sm text-gray-800 mt-1.5 flex items-start gap-1.5">
                        <MapPin size={14} className="mt-[3px] shrink-0 text-gray-400" />{' '}
                        <span className="line-clamp-2">{facAddress}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                      <Car size={14} /> Loại xe
                    </p>
                    <div className="flex items-center">
                      {(() => {
                        const vtObj = vehicleTypes.find(v => v._id === vtId);
                        const colorTheme = getVehicleColorTheme(vtObj?.code, vtObj?.icon);
                        return (
                          <span
                            className="px-2.5 py-1.5 text-[12px] font-semibold rounded-lg flex items-center gap-1.5"
                            style={{ background: colorTheme.bg, color: colorTheme.text }}
                          >
                            <VtIcon size={14} color={colorTheme.text} strokeWidth={2} /> {vtName}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                      <CreditCard size={14} /> Loại giá
                    </p>
                    <div className="flex items-center">
                      <span
                        className={`font-semibold px-2.5 py-1.5 rounded-lg text-[12px] ${FEE_TYPE_BADGE[uiFeeType] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {FEE_TYPE_LABELS[uiFeeType] ?? plan.feeType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed rates & Surcharges */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-3">
                    <DollarSign size={14} /> Bảng giá chi tiết
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {plan.rates.map((rate, idx) => (
                      <div
                        key={idx}
                        className={`p-4 flex justify-between items-center ${idx !== plan.rates.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <span className="text-gray-500 font-semibold text-xs">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {translateLabel(rate.label)}
                              {idx === 0 &&
                                plan.feeMethod === 'duration_based' &&
                                plan.firstBlockHours &&
                                plan.firstBlockHours > 1 &&
                                ` (${plan.firstBlockHours} giờ)`}
                            </p>
                            {rate.startTime && rate.endTime && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Thời gian: {rate.startTime} - {rate.endTime}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#062F28] text-[15px]">
                            {fmt(rate.amount)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            /{translateUnit(rate.unit)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(plan.overnightFee > 0 ||
                  plan.overtimeFeePerHour > 0 ||
                  plan.lostCardFee > 0 ||
                  (plan.gracePeriodMinutes && plan.gracePeriodMinutes > 0) ||
                  (plan.maxDailyFee && plan.maxDailyFee > 0)) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-3">
                      <Info size={14} /> Phụ phí & Quy định khác
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plan.gracePeriodMinutes ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#9FE870]/15 text-[#062F28] flex items-center justify-center shrink-0">
                            <ShieldCheck size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-medium">Thời gian miễn phí</p>
                            <p className="text-sm font-semibold text-[#062F28]">
                              {plan.gracePeriodMinutes} phút đầu
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {plan.maxDailyFee ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#9FE870]/15 text-[#062F28] flex items-center justify-center shrink-0">
                            <TrendingUp size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-medium">Phí trần tối đa</p>
                            <p className="text-sm font-semibold text-[#062F28]">
                              {fmt(plan.maxDailyFee)} / ngày
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {plan.overnightFee > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#9FE870]/15 text-[#062F28] flex items-center justify-center shrink-0">
                            <Moon size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-medium">Phí qua đêm</p>
                            <p className="text-sm font-semibold text-[#062F28]">
                              {fmt(plan.overnightFee)} / đêm
                            </p>
                          </div>
                        </div>
                      )}
                      {plan.overtimeFeePerHour > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#9FE870]/15 text-[#062F28] flex items-center justify-center shrink-0">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-medium">Phí quá giờ</p>
                            <p className="text-sm font-semibold text-[#062F28]">
                              {fmt(plan.overtimeFeePerHour)} / giờ
                            </p>
                          </div>
                        </div>
                      )}
                      {plan.lostCardFee > 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#9FE870]/15 text-[#062F28] flex items-center justify-center shrink-0">
                            <CreditCard size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 font-medium">Phí mất thẻ</p>
                            <p className="text-sm font-semibold text-[#062F28]">
                              {fmt(plan.lostCardFee)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex justify-end bg-white">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
