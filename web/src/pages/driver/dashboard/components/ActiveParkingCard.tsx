import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CreditCard, Navigation, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SessionStatus } from '../../../../services/session.service';

interface ActiveParkingCardProps {
  activeSession: any;
  qrUrl: string;
  onShowPayment: () => void;
}

export const ActiveParkingCard: React.FC<ActiveParkingCardProps> = ({
  activeSession,
  qrUrl,
  onShowPayment
}) => {
  // Live Timer Logic
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const checkInMs = new Date(activeSession.checkInTime).getTime();
    
    const updateTimer = () => {
      // Tính hiệu số thời gian an toàn. Chạy độc lập trong component để không bị lag cả trang
      const nowMs = Date.now();
      const diffSecs = Math.floor(Math.max(0, nowMs - checkInMs) / 1000);
      setElapsed(diffSecs);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession.checkInTime]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  // Format license plate (e.g. 51G-12345)
  const plate = activeSession.licensePlate || '';
  const platePart1 = plate.substring(0, 3);
  const platePart2 = plate.substring(3);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full relative z-10">
      {/* Left Column: QR Code & Status */}
      <div className="w-full xl:w-[35%] bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-between shadow-[0_20px_40px_rgb(0,0,0,0.2)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="w-full flex justify-between items-center mb-8 relative z-10">
          <ShieldCheck className="text-emerald-400" size={28} />
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ĐANG GỬI XE
          </span>
        </div>

        <div className="bg-white p-4 rounded-[1.5rem] shadow-xl relative z-10 mb-8 border-[6px] border-slate-800 group transition-all duration-300 hover:border-accent/30">
          <img src={qrUrl} alt="Session QR" className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-xl group-hover:scale-105 transition-transform duration-500" />
        </div>
        
        <div className="text-center relative z-10 mt-auto">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">Mã Phiếu Đỗ</p>
          <p className="text-3xl font-mono font-black tracking-[0.25em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{activeSession.code}</p>
        </div>
      </div>

      {/* Right Column: Information & Dashboard */}
      <div className="w-full xl:w-[65%] flex flex-col gap-6">
        
        {/* Row 1: Live Timer & Live Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[180px]">
          {/* Live Timer Card */}
          <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors" />
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <Clock size={16} className="text-blue-500" /> Thời Gian Đã Đỗ
            </p>
            <div className="flex items-baseline gap-2 text-slate-900 font-mono relative z-10 tabular-nums">
              <span className="text-5xl md:text-6xl font-black tracking-tighter">{pad(hrs)}</span><span className="text-xl md:text-2xl text-slate-300 font-bold mb-1">:</span>
              <span className="text-5xl md:text-6xl font-black tracking-tighter">{pad(mins)}</span><span className="text-xl md:text-2xl text-slate-300 font-bold mb-1">:</span>
              <span className="text-5xl md:text-6xl font-black tracking-tighter text-blue-600">{pad(secs)}</span>
            </div>
            <p className="text-slate-400 text-xs mt-4 relative z-10 font-medium">
              Vào lúc: {new Date(activeSession.checkInTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>

          {/* Live Cost Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-[2rem] p-6 md:p-8 shadow-md flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <CreditCard size={16} className="text-emerald-400" /> Ước Tính Phí
            </p>
            <div className="flex items-baseline gap-1 text-emerald-400 font-mono relative z-10">
              <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {(activeSession.totalFee || 0).toLocaleString('vi-VN')}
              </span>
              <span className="text-2xl font-bold">₫</span>
            </div>
            <p className="text-slate-500 text-xs mt-4 relative z-10 font-medium">Cập nhật tự động theo block giờ</p>
          </div>
        </div>

        {/* Row 2: Vehicle Details & Location */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm flex-1 flex flex-col md:flex-row gap-8 items-center justify-between hover:shadow-md transition-all">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Biển Số Xe</p>
            {/* Real-world License Plate styling */}
            <div className="bg-white border-2 border-slate-800 rounded-xl px-5 py-2 flex flex-col items-center justify-center min-w-[140px] shadow-sm relative overflow-hidden">
               <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-300 absolute top-2 left-2" />
               <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-300 absolute top-2 right-2" />
               <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-300 absolute bottom-2 left-2" />
               <div className="w-2 h-2 rounded-full bg-slate-200 border border-slate-300 absolute bottom-2 right-2" />
               
               <span className="text-2xl font-black text-slate-900 tracking-wider mb-[-4px]">{platePart1}</span>
               <span className="text-3xl font-black text-slate-900 tracking-widest">{platePart2}</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-24 bg-slate-100" />

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-rose-500" /> Vị Trí Đỗ Xe
            </p>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
              {(activeSession.facilityId as any)?.name || 'Hệ thống Smart Parking'}
            </h4>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-semibold">
                 Cổng vào: <span className="text-slate-900">{activeSession.gateIn}</span>
               </span>
               <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1">
                 <CheckCircle2 size={14} /> Check-in thành công
               </span>
            </div>
          </div>
        </div>

        {/* Row 3: Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow">
            <Navigation size={18} className="text-blue-500" />
            Chỉ Đường
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow">
            <Phone size={18} className="text-rose-500" />
            Cứu Hộ
          </button>
          {activeSession.status === SessionStatus.PENDING_PAYMENT && (
            <button 
              onClick={onShowPayment}
              className="flex-[1.5] group flex items-center justify-center gap-2 py-4 bg-accent text-brand font-black rounded-2xl hover:brightness-105 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Thanh Toán Trước
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
