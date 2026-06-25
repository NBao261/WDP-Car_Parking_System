import React from 'react';
import { Car, Clock, MapPin, CreditCard } from 'lucide-react';
import { SessionStatus } from '../../../../services/session.service';

const OdometerValue = ({ value }: { value: number }) => {
  return (
    <span className="font-mono text-4xl sm:text-5xl font-bold text-emerald-600">
      {value.toLocaleString('vi-VN')}₫
    </span>
  );
};

interface ActiveSessionCardProps {
  activeSession: any;
  qrUrl: string;
  diffHrs: number;
  diffMins: number;
  checkInDate: Date;
  onShowPayment: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  activeSession,
  qrUrl,
  diffHrs,
  diffMins,
  checkInDate,
  onShowPayment
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main QR Card */}
      <div className="flex-1 bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
        <h3 className="text-muted-foreground font-semibold mb-6 relative z-10 text-sm tracking-widest uppercase">Quét QR Để Ra Cổng</h3>
        <div className="bg-white p-4 rounded-2xl shadow-sm relative z-10 border border-border">
          <img src={qrUrl} alt="Session QR" className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-lg" />
        </div>
        <p className="mt-6 text-2xl font-mono font-bold tracking-[0.2em] text-brand relative z-10">{activeSession.code}</p>
      </div>

      {/* Info & Odometer Side */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        
        {/* Fee Odometer */}
        <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm h-[180px]">
          <p className="text-muted-foreground font-medium mb-3 flex items-center gap-2"><CreditCard size={18} /> Phí Tạm Tính</p>
          <OdometerValue value={activeSession.totalFee || 0} />
        </div>

        {/* Session Info Details */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex-1">
          <h4 className="text-brand font-bold mb-4 font-outfit border-b border-border pb-2">Thông Tin Chi Tiết</h4>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Car size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Biển số xe</p>
                <p className="text-brand font-bold text-lg">{activeSession.licensePlate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Thời gian gửi</p>
                <p className="text-brand font-bold text-lg">{diffHrs} <span className="text-sm font-normal text-muted-foreground">giờ</span> {diffMins} <span className="text-sm font-normal text-muted-foreground">phút</span></p>
                <p className="text-muted-foreground text-xs mt-0.5">Vào lúc: {checkInDate.toLocaleTimeString('vi-VN')} - {checkInDate.toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Vị trí</p>
                <p className="text-brand font-bold">{(activeSession.facilityId as any)?.name || 'Đang cập nhật'}</p>
                <p className="text-muted-foreground text-xs mt-0.5">Cổng vào: {activeSession.gateIn}</p>
              </div>
            </div>
          </div>

          {activeSession.status === SessionStatus.PENDING_PAYMENT && (
            <button 
              onClick={onShowPayment}
              className="w-full mt-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:shadow-md transition-all"
            >
              Thanh Toán Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
