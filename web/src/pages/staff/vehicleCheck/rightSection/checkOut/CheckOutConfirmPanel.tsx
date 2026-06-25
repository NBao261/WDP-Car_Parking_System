import { CheckCircle2 } from "lucide-react";

interface CheckOutConfirmPanelProps {
  data?: {
    owner?: string;
    checkInTime?: string;
    checkOutTime?: string;
    checkInDate?: string;
    checkOutDate?: string;
    gateIn?: string;
    fee?: number;
    rawCheckInTime?: string;
    zone?: string;
  };
  isMismatch?: boolean;
}

export function CheckOutConfirmPanel({ data, isMismatch = false }: CheckOutConfirmPanelProps) {
  if (!data) {
    return (
      <div className="w-full h-[170px] border-2 border-[#A3E635] rounded-[8px] flex items-center justify-center bg-white mt-2 shrink-0">
        <img src="/Logo_chu.png" alt="LYNC PARK" className="h-20 object-contain opacity-80" />
      </div>
    );
  }

  const { owner = "—", checkInTime = "—", checkOutTime = "—", checkInDate = "—", checkOutDate = "—", gateIn = "—", fee = 0, rawCheckInTime, zone = "—" } = data || {};

  let durationStr = "";
  if (rawCheckInTime) {
    const checkIn = new Date(rawCheckInTime);
    const checkOut = new Date();
    const diffMs = checkOut.getTime() - checkIn.getTime();
    if (diffMs > 0) {
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) durationStr = `${hours} giờ ${minutes} phút`;
      else durationStr = `${minutes} phút`;
    }
  }

  return (
    <div className="flex h-[170px] border-2 border-[#A3E635] rounded-[8px] mt-2 bg-white overflow-hidden shrink-0">
      <div className="flex-1 px-5 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 shrink-0 mb-3">
          <CheckCircle2 className="text-[#65A30D] w-[18px] h-[18px]" />
          <h3 className="text-[13px] font-bold text-[#65A30D] uppercase">Xác Nhận Xe Ra</h3>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold text-[#6b6b6b]">Chủ xe:</span>
          <span className="text-[11px] font-bold text-[#333]">{owner}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold text-[#6b6b6b]">Giờ vào:</span>
            <span className="text-[11px] font-bold text-[#333]">{checkInTime}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold text-[#6b6b6b]">Ngày vào:</span>
            <span className="text-[11px] font-bold text-[#333]">{checkInDate}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold text-[#6b6b6b]">Cổng vào:</span>
            <span className="text-[11px] font-bold text-[#333]">{gateIn}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold text-[#6b6b6b]">Giờ ra:</span>
            <span className="text-[11px] font-bold text-[#333]">{checkOutTime}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-semibold text-[#6b6b6b]">Ngày ra:</span>
            <span className="text-[11px] font-bold text-[#333]">{checkOutDate}</span>
          </div>
        </div>
      </div>
      <div className="w-[1px] bg-[#e8e9e8] my-4 shrink-0"></div>
      <div className="w-[150px] p-4 flex flex-col items-end justify-center shrink-0">
        <span className="text-[10px] font-semibold text-[#888] mb-1">Tổng tiền (VNĐ):</span>
        <span className={`text-[22px] font-bold leading-none mb-1 text-right ${isMismatch ? 'text-[#bbb]' : 'text-[#060606]'}`}>
          {isMismatch ? "_" : `${fee.toLocaleString('vi-VN')} đ`}
        </span>
        <div className={`w-8 h-[1px] mt-1 mb-2 rounded-full self-end ${isMismatch ? 'bg-[#bbb]' : 'bg-[#EF4444]'}`}></div>
        {durationStr && (
          <div className="flex flex-col items-end mt-1">
            <span className="text-[9px] font-medium text-[#888]">Thời gian gửi:</span>
            <span className="text-[11px] font-bold text-[#333] text-right">{durationStr}</span>
          </div>
        )}
      </div>
    </div>
  );
}
