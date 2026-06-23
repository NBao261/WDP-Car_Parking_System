import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, QrCode, X } from 'lucide-react';
import { PricingPlan } from '../../../../services/pricing.service';
import { useNavigate } from 'react-router-dom';

interface SuccessTicketModalProps {
  reservationResult: any;
  facility: any;
  activePlan: PricingPlan | undefined;
  onClose: () => void;
}

export const SuccessTicketModal: React.FC<SuccessTicketModalProps> = ({
  reservationResult,
  facility,
  activePlan,
  onClose
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {reservationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 w-full max-w-md flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Ticket */}
            <div className="bg-brand text-white p-6 text-center relative overflow-hidden shrink-0">
              <div className="absolute -left-4 -bottom-4 w-8 h-8 bg-white rounded-full" />
              <div className="absolute -right-4 -bottom-4 w-8 h-8 bg-white rounded-full" />
              
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold font-outfit mb-1">Đã giữ chỗ thành công</h2>
              <p className="text-white/70 text-xs">Hệ thống đã chuẩn bị sẵn sàng vị trí cho bạn</p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 bg-white relative flex-1 overflow-y-auto max-h-[60vh] sm:max-h-none scrollbar-hide">
              <div className="border-b-2 border-dashed border-slate-200 absolute top-0 left-4 right-4" />
              
              <div className="flex flex-col items-center mb-5 mt-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Vị trí đỗ của bạn</span>
                <div className="text-center">
                  <div className="text-5xl font-black text-brand tracking-tighter leading-none">{reservationResult.slotId?.code || '---'}</div>
                  <div className="text-sm font-medium text-slate-500 mt-2">
                    {reservationResult.slotId?.floorId?.name || 'Tầng mặc định'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Bãi xe</span>
                  <span className="text-brand font-bold text-right max-w-[60%] line-clamp-1">{reservationResult.facilityId?.name || facility?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Loại xe</span>
                  <span className="text-brand font-bold">{reservationResult.vehicleTypeId?.name || (activePlan?.vehicleTypeId as any)?.name || '---'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Biển số</span>
                  <span className="text-brand font-bold font-mono tracking-wider bg-white px-2 py-0.5 border border-slate-200 rounded">{reservationResult.licensePlate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Thời gian tới</span>
                  <span className="text-brand font-bold">
                    {new Date(reservationResult.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* Divider */}
                <div className="border-t border-slate-200 border-dashed pt-3 mt-1">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Chi tiết gói cước</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">Phí Block đầu</span>
                    <span className="font-bold text-brand">{activePlan?.rates?.[0]?.amount?.toLocaleString('vi-VN') || 0}đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Phí mỗi giờ tiếp theo</span>
                    <span className="font-bold text-brand">{activePlan?.overtimeFeePerHour?.toLocaleString('vi-VN') || 0}đ/h</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 mb-6">
                <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <QrCode size={64} className="text-brand" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest">{reservationResult.code}</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/driver')}
                  className="flex-1 py-3 rounded-xl bg-white text-slate-600 hover:text-brand hover:bg-slate-50 font-bold transition-all border border-slate-200 text-sm"
                >
                  Về trang chủ
                </button>
                <button 
                  onClick={() => navigate('/driver/history')}
                  className="flex-1 py-3 rounded-xl bg-brand hover:bg-slate-800 text-white font-bold transition-all shadow-md text-sm"
                >
                  Xem lịch sử
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
