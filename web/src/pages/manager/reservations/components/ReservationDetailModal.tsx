import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Car, MapPin, Hash, Clock, DollarSign, Ticket } from 'lucide-react';
import { IReservation, ReservationStatus } from '../../../../services/reservation.service';
import { Badge } from '../../../../components/ui/badge';

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: IReservation | null;
}

export function ReservationDetailModal({ isOpen, onClose, reservation }: ReservationDetailModalProps) {
  if (!isOpen || !reservation) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case ReservationStatus.CONFIRMED:
        return <Badge variant="success">Đã xác nhận</Badge>;
      case ReservationStatus.USED:
        return <Badge variant="info">Đã sử dụng</Badge>;
      case ReservationStatus.CANCELLED:
        return <Badge variant="destructive">Đã hủy</Badge>;
      case ReservationStatus.EXPIRED:
        return <Badge variant="secondary">Hết hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#060606]/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-3xl bg-[#f8f9fa] rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b-4 border-[#96a827] flex items-center justify-between sticky top-0 bg-[#060606] z-10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Ticket className="w-6 h-6 text-[#96a827]" />
                CHI TIẾT ĐẶT CHỖ
              </h2>
              <p className="text-[13px] text-gray-400 mt-1 flex items-center gap-2">
                Mã giao dịch: 
                <span className="text-[#96a827] font-mono font-bold bg-[#96a827]/10 px-2 py-0.5 rounded border border-[#96a827]/30">
                  {reservation.code}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white backdrop-blur-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6 bg-white border border-[#e8e9e8] p-5 rounded-[14px] shadow-sm">
              <div>
                <p className="text-[11px] text-[#6b6b6b] font-bold uppercase tracking-wider mb-2">Trạng thái hiện tại</p>
                <div className="scale-110 origin-left">{getStatusBadge(reservation.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#6b6b6b] font-bold uppercase tracking-wider mb-2">Ngày tạo</p>
                <p className="text-[13px] font-bold text-[#060606] bg-[#f5f5f4] px-3 py-1.5 rounded-lg border border-[#e8e9e8]">
                  {formatDate(reservation.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cột 1 */}
              <div className="space-y-5">
                {/* Khách hàng */}
                <div className="bg-white border border-[#e8e9e8] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-[13px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#f5f5f4] pb-3">
                    <div className="bg-[#96a827]/10 p-1.5 rounded-lg">
                      <User size={16} className="text-[#96a827]" />
                    </div>
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Họ và tên</span>
                      <span className="text-[14px] font-bold text-[#060606]">{reservation.userId?.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Số điện thoại</span>
                      <span className="text-[14px] font-bold text-[#060606]">{reservation.userId?.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Email</span>
                      <span className="text-[13px] font-medium text-[#060606] truncate max-w-[150px]" title={reservation.userId?.email}>
                        {reservation.userId?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Xe & Vị trí */}
                <div className="bg-white border border-[#e8e9e8] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-[13px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#f5f5f4] pb-3">
                    <div className="bg-[#96a827]/10 p-1.5 rounded-lg">
                      <Car size={16} className="text-[#96a827]" />
                    </div>
                    Thông tin xe & Vị trí
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Loại xe</span>
                      <span className="text-[14px] font-bold text-[#060606]">{reservation.vehicleTypeId?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Biển số xe</span>
                      <span className="text-[15px] font-bold text-[#060606] bg-[#d7ee46]/30 border border-[#96a827]/40 px-2.5 py-1 rounded-md uppercase font-mono shadow-sm">
                        {reservation.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Bãi đỗ</span>
                      <span className="text-[13px] font-bold text-[#060606] bg-[#f5f5f4] px-2.5 py-1 rounded-md">
                        {reservation.facilityId?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Vị trí (Slot)</span>
                      <span className={`text-[14px] font-black px-3 py-1 rounded-md border ${
                        reservation.slotId 
                          ? 'bg-[#060606] text-[#d7ee46] border-[#060606]' 
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {reservation.slotId ? reservation.slotId.code : 'Chưa xếp chỗ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-5">
                {/* Thời gian */}
                <div className="bg-white border border-[#e8e9e8] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-[13px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#f5f5f4] pb-3">
                    <div className="bg-[#96a827]/10 p-1.5 rounded-lg">
                      <Clock size={16} className="text-[#96a827]" />
                    </div>
                    Thời gian giữ chỗ
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-[#f5f5f4] p-3 rounded-xl border border-[#e8e9e8]">
                      <span className="block text-[11px] text-[#6b6b6b] font-bold uppercase mb-1">Giờ vào dự kiến</span>
                      <span className="block text-[14px] font-bold text-[#060606]">{formatDate(reservation.startTime)}</span>
                    </div>
                    <div className="bg-[#f5f5f4] p-3 rounded-xl border border-[#e8e9e8]">
                      <span className="block text-[11px] text-[#6b6b6b] font-bold uppercase mb-1">Giờ ra dự kiến</span>
                      <span className="block text-[14px] font-bold text-[#060606]">{formatDate(reservation.endTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Tài chính */}
                <div className="bg-white border border-[#e8e9e8] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-[13px] font-bold text-[#060606] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#f5f5f4] pb-3">
                    <div className="bg-[#96a827]/10 p-1.5 rounded-lg">
                      <DollarSign size={16} className="text-[#96a827]" />
                    </div>
                    Tài chính
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Phí đặt chỗ</span>
                      <span className="text-[14px] font-bold text-[#060606]">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#6b6b6b] font-medium">Phí hủy (Nếu có)</span>
                      <span className={`text-[15px] font-black ${
                        reservation.cancellationFee > 0 
                          ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100' 
                          : 'text-[#060606]'
                      }`}>
                        {reservation.cancellationFee.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e8e9e8] bg-white flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-[#d7ee46] text-[#060606] text-[14px] font-bold rounded-xl hover:brightness-95 transition-all shadow-sm flex items-center gap-2"
            >
              Đóng cửa sổ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
