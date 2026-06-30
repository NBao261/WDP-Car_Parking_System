import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Receipt } from 'lucide-react';
import { PricingPlan } from '../../../../services/pricing.service';

interface FacilitySummaryProps {
  facility: any;
  activePlan: PricingPlan | undefined;
  currentAvailableCount: number | null;
  priceFormatted: string;
  isSubmitting: boolean;
  isFormValid: boolean;
  handleSubmit: () => void;
}

export const FacilitySummary: React.FC<FacilitySummaryProps> = ({
  facility,
  activePlan,
  currentAvailableCount,
  priceFormatted,
  isSubmitting,
  isFormValid,
  handleSubmit,
}) => {
  // Logic hiển thị Capacity Indicator FOMO
  const vehicleName = (activePlan?.vehicleTypeId as any)?.name || 'phương tiện của bạn';
  const fakeTotal =
    currentAvailableCount !== null
      ? Math.max(50, currentAvailableCount + (currentAvailableCount < 10 ? 2 : 20))
      : 100;
  const percentage =
    currentAvailableCount !== null
      ? Math.min(100, Math.max(0, (currentAvailableCount / fakeTotal) * 100))
      : 0;

  let statusColor = 'bg-emerald-500';
  let statusTextColor = 'text-emerald-600';
  let statusBg = 'bg-emerald-50';
  let statusBorder = 'border-emerald-200';
  let statusText = 'Rộng rãi';
  let fomoText =
    currentAvailableCount !== null
      ? `Còn ${currentAvailableCount} chỗ trống cho ${vehicleName}.`
      : 'Đang kiểm tra chỗ trống...';

  if (currentAvailableCount === 0) {
    statusColor = 'bg-red-500';
    statusTextColor = 'text-red-600';
    statusBg = 'bg-red-50';
    statusBorder = 'border-red-200';
    statusText = 'Đã hết chỗ';
    fomoText = `Rất tiếc, bãi đã kín chỗ cho ${vehicleName}.`;
  } else if (currentAvailableCount !== null && currentAvailableCount <= 5) {
    statusColor = 'bg-orange-500';
    statusTextColor = 'text-orange-600';
    statusBg = 'bg-orange-50';
    statusBorder = 'border-orange-200';
    statusText = 'Sắp đầy';
    fomoText = `Chỉ còn đúng ${currentAvailableCount} chỗ cho ${vehicleName} - Đặt ngay kẻo lỡ!`;
  } else if (currentAvailableCount !== null && currentAvailableCount <= 15) {
    statusColor = 'bg-amber-500';
    statusTextColor = 'text-amber-600';
    statusBg = 'bg-amber-50';
    statusBorder = 'border-amber-200';
    statusText = 'Nhanh đầy';
    fomoText = `Còn ${currentAvailableCount} chỗ cho ${vehicleName}. Lượng xe đang tăng nhanh.`;
  }

  return (
    <div className="w-full lg:w-[400px] flex flex-col gap-6">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {facility?.images && facility.images.length > 0 ? (
          <img src={facility.images[0]} alt="Facility" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground font-bold tracking-widest uppercase opacity-50">
              {facility?.name || 'LYNC'}
            </span>
          </div>
        )}

        <div className="p-5 border-b border-border">
          <h3 className="text-xl font-bold text-brand mb-2">{facility?.name || 'Đang tải...'}</h3>
          <div className="flex items-start gap-2 text-muted-foreground text-sm">
            <MapPin size={16} className="text-accent-dark shrink-0 mt-0.5" />
            <span className="leading-snug">{facility?.address || '...'}</span>
          </div>
        </div>

        {/* Capacity Indicator Block */}
        <AnimatePresence mode="wait">
          {currentAvailableCount !== null && activePlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 bg-card"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-brand">Trạng thái chỗ đỗ</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBg} ${statusTextColor} ${statusBorder}`}
                >
                  {statusText}
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${statusColor}`}
                />
              </div>

              <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                {currentAvailableCount <= 5 && currentAvailableCount > 0 && (
                  <span className="animate-pulse text-orange-500">🔥</span>
                )}
                {fomoText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {activePlan ? (
          <motion.div
            key={activePlan._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-brand font-bold flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Receipt size={18} /> Bảng Giá Phí
            </h3>

            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground text-sm">
                Phí Block đầu ({activePlan.firstBlockHours ? activePlan.firstBlockHours * 60 : 0}{' '}
                phút)
              </span>
              <span className="font-bold text-brand">{priceFormatted}đ</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground text-sm">Phí theo giờ tiếp theo</span>
              <span className="font-bold text-brand">
                {activePlan.overtimeFeePerHour?.toLocaleString('vi-VN') || 0}đ/h
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border border-dashed">
              <span className="text-muted-foreground text-sm">Giá tối đa / ngày</span>
              <span className="font-bold text-emerald-600">
                {activePlan.maxDailyFee?.toLocaleString('vi-VN') || 0}đ
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm flex flex-col gap-2"
          >
            <h3 className="text-red-700 font-bold flex items-center gap-2">
              <Receipt size={18} /> Chưa có bảng giá
            </h3>
            <p className="text-red-600/80 text-sm font-medium">
              Tòa nhà hiện chưa thiết lập bảng giá cho loại phương tiện này. Xin vui lòng chọn loại xe khác hoặc liên hệ Ban quản lý.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        data-testid="submit-booking-btn"
        onClick={handleSubmit}
        disabled={isSubmitting || !isFormValid}
        className="w-full py-4 rounded-xl bg-brand hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold transition-all shadow-lg hover:shadow-xl flex justify-center items-center text-lg gap-2"
      >
        {isSubmitting ? (
          <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Xác Nhận Đặt Chỗ <span className="opacity-50 font-normal">|</span> {priceFormatted}đ
          </>
        )}
      </button>
    </div>
  );
};
