import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Hash, Ban, CheckCircle2, MapPin, Car } from 'lucide-react';
import { Reservation } from '../../../../services/reservation.service';

interface HistoryCardProps {
  reservation: Reservation;
  index: number;
  onCancel: (id: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ reservation, index, onCancel }) => {
  const startDate = new Date(reservation.startTime);
  const isCancellable = reservation.status === 'CONFIRMED';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'USED': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'CANCELLED': return 'text-red-700 bg-red-100 border-red-200';
      case 'EXPIRED': return 'text-amber-700 bg-amber-100 border-amber-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Sắp tới';
      case 'USED': return 'Đã sử dụng';
      case 'CANCELLED': return 'Đã hủy';
      case 'EXPIRED': return 'Quá hạn';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-3">
          <span className="text-xs text-muted-foreground">Mã: #{reservation.code}</span>
          <h3 className="text-lg font-bold text-brand font-outfit mt-1">{reservation.facilityId?.name || 'Bãi xe'}</h3>
          {reservation.facilityId?.address && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" title={reservation.facilityId.address}>
              {reservation.facilityId.address}
            </p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide ${getStatusColor(reservation.status)}`}>
          {getStatusLabel(reservation.status)}
        </span>
      </div>

      <div className="space-y-3 mb-6 flex-1 mt-2">
        {reservation.slotId?.code && (
          <div className="flex items-center gap-3 text-sm text-brand p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <MapPin size={18} className="text-accent-dark shrink-0" />
            <span className="font-medium text-slate-600">Vị trí đỗ:</span>
            <span className="font-bold text-lg bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 ml-auto">
              {reservation.slotId.code}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Car size={16} className="text-accent-dark shrink-0" />
          <span>Phương tiện: <span className="text-brand font-semibold">{reservation.vehicleTypeId?.name || 'Xe'} - {reservation.licensePlate}</span></span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar size={16} className="text-accent-dark" />
          <span>Ngày: <span className="text-brand font-semibold">{startDate.toLocaleDateString('vi-VN')}</span></span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock size={16} className="text-accent-dark" />
          <span>Giờ vào dự kiến: <span className="text-brand font-semibold">{startDate.toLocaleTimeString('vi-VN')}</span></span>
        </div>
        {reservation.cancellationFee > 0 && (
          <div className="flex items-center gap-3 text-sm text-red-600 mt-2 p-2 bg-red-50 rounded-lg">
            <span>Phí hủy: <span className="font-bold">{reservation.cancellationFee.toLocaleString('vi-VN')}₫</span></span>
          </div>
        )}
      </div>

      {isCancellable && (
        <button
          onClick={() => onCancel(reservation._id)}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 font-semibold border border-border hover:border-red-200 transition-all flex justify-center items-center gap-2"
        >
          <Ban size={16} /> Hủy Đặt Chỗ
        </button>
      )}
      {!isCancellable && reservation.status === 'USED' && (
        <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-semibold flex justify-center items-center gap-2 border border-emerald-100">
          <CheckCircle2 size={16} /> Hoàn Thành
        </div>
      )}
    </motion.div>
  );
};
