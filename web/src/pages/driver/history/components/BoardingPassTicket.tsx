import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Reservation } from '../../../../services/reservation.service';
import { QrCode, MapPin, Clock, Calendar, Trash2, Copy, Check, Car } from 'lucide-react';

interface BoardingPassTicketProps {
  reservation: Reservation;
  index: number;
  onCancel: (id: string) => void;
}

export const BoardingPassTicket: React.FC<BoardingPassTicketProps> = ({ reservation, index, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const startDate = new Date(reservation.startTime);
  const normalizedStatus = (reservation.status || '').toUpperCase();
  const isCancellable = normalizedStatus === 'CONFIRMED';
  const isInactive = normalizedStatus === 'CANCELLED' || normalizedStatus === 'EXPIRED';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { color: 'text-emerald-50', bg: 'bg-emerald-400/20', border: 'border-emerald-200/50', label: 'SẮP TỚI' };
      case 'USED': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-200', label: 'HOÀN THÀNH' };
      case 'CANCELLED': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-200', label: 'ĐÃ HỦY' };
      case 'EXPIRED': return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-200', label: 'QUÁ HẠN' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-200', label: status };
    }
  };

  const statusConfig = getStatusConfig(normalizedStatus);

  const handleCopy = () => {
    navigator.clipboard.writeText(reservation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className={`relative bg-white rounded-[2rem] border border-slate-200/80 flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group ${
        isInactive ? 'grayscale-[0.5] opacity-70 hover:grayscale-0 hover:opacity-100' : ''
      }`}
    >
      {/* Animated Shimmer Effect for Active Tickets */}
      {!isInactive && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-20 pointer-events-none" />
      )}

      {/* Cutouts for ticket effect */}
      <div className="hidden md:block absolute top-0 bottom-0 left-[68%] w-[2px] border-l-[3px] border-dotted border-slate-200/80 z-10" />
      <div className="hidden md:block absolute -top-5 left-[68%] -translate-x-1/2 w-10 h-10 bg-[#f8fafc] rounded-full border-b border-slate-200/80 shadow-inner z-10" />
      <div className="hidden md:block absolute -bottom-5 left-[68%] -translate-x-1/2 w-10 h-10 bg-[#f8fafc] rounded-full border-t border-slate-200/80 shadow-inner z-10" />

      {/* Left: Trip Details */}
      <div className="flex-1 p-6 md:p-8 md:pr-14 relative bg-gradient-to-br from-white to-slate-50/50">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Mã Vé</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Sao chép mã vé"
              >
                <span className="font-mono text-xs font-semibold">#{reservation.code}</span>
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1">{reservation.facilityId?.name || 'Bãi đỗ xe'}</h3>
            <div className="flex items-start gap-1.5 text-slate-500 mt-2">
              <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
              <p className="text-sm line-clamp-2 leading-relaxed font-medium">{reservation.facilityId?.address || 'Chưa cập nhật địa chỉ'}</p>
            </div>
          </div>
          {/* Mobile Badge */}
          <span className={`md:hidden ${statusConfig.bg} ${statusConfig.color} font-bold px-3 py-1 rounded-full text-[10px] uppercase border ${statusConfig.border}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm ring-1 ring-slate-900/5">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5"><Car size={12}/> Phương tiện</p>
            <p className="font-semibold text-slate-700 text-sm truncate mb-2">{reservation.vehicleTypeId?.name || 'Xe'}</p>
            
            {/* Real License Plate UI */}
            <div className="inline-flex items-center border-[1.5px] border-slate-300 rounded shadow-sm overflow-hidden h-7 bg-white">
              <div className="bg-blue-600 w-3 h-full flex flex-col justify-center items-center">
                <span className="text-[5px] font-bold text-white leading-none">VN</span>
              </div>
              <span className="px-2.5 font-mono font-bold text-slate-800 text-[13px] tracking-widest">{reservation.licensePlate}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5"><Clock size={12}/> Thời gian vào</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-brand text-lg">{startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
              <Calendar size={14} className="text-slate-400" />
              {startDate.toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Status, Slot & QR */}
      <div className={`md:w-[32%] p-6 md:p-8 flex flex-col justify-between items-center text-center relative z-20 ${
        isCancellable ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-slate-800'
      }`}>
        {/* Background Graphic */}
        <QrCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-white/[0.05] pointer-events-none" />

        {/* PC Badge */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <span className={`hidden md:inline-flex items-center justify-center ${statusConfig.bg} ${statusConfig.color} font-black px-4 py-1.5 rounded-full text-xs border ${statusConfig.border} tracking-widest uppercase mb-6 shadow-sm backdrop-blur-md`}>
            {statusConfig.label}
          </span>
          
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Vị Trí Đỗ</p>
          <div className="text-6xl font-black text-white tracking-tighter drop-shadow-md mb-6">
            {reservation.slotId?.code || '--'}
          </div>
        </div>

        {/* Interactive QR Button */}
        <button 
          onClick={() => setShowQR(!showQR)}
          className="relative z-10 flex items-center gap-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all font-medium text-sm mb-4"
        >
          <QrCode size={16} /> 
          {showQR ? 'Đóng mã QR' : 'Mã nhận diện'}
        </button>

        {isCancellable ? (
          <button
            onClick={() => onCancel(reservation._id)}
            className="relative z-10 flex items-center gap-1.5 text-red-400/80 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-400/20 font-medium text-xs transition-all mt-auto"
          >
            <Trash2 size={14} /> Hủy đặt chỗ
          </button>
        ) : (
          reservation.cancellationFee > 0 && (
            <div className="mt-auto text-red-300/80 text-xs font-semibold tracking-wide bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              Phí hủy: {reservation.cancellationFee.toLocaleString('vi-VN')}₫
            </div>
          )
        )}
      </div>

      {/* QR Code Overlay (Full Screen Modal using Portal) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowQR(false)} />
              
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center w-full max-w-sm"
              >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-6">Mã Vé: #{reservation.code}</h3>
                
                <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-slate-100 mb-6 w-full flex justify-center ring-4 ring-slate-50">
                  <QrCode size={220} className="text-slate-900" strokeWidth={1.5} />
                </div>
                
                <p className="text-slate-500 text-center text-sm mb-8 font-medium px-4">
                  Vui lòng đưa mã QR này cho nhân viên bảo vệ hoặc quét tại cổng để xác nhận vé.
                </p>
                
                <button 
                  onClick={() => setShowQR(false)}
                  className="w-full py-4 bg-slate-900 hover:bg-accent hover:text-brand text-white rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg"
                >
                  Đóng Mã QR
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};
