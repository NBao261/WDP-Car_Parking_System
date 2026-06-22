import { CheckCircle2 } from "lucide-react";

interface CheckOutConfirmPanelProps {
  data?: {
    ticketCode?: string;
    plateIn?: string;
    plateOut?: string;
    checkInTime?: string;
    checkOutTime?: string;
    checkInDate?: string;
    checkOutDate?: string;
    gateIn?: string;
    gateOut?: string;
    fee?: number;
    feeDetails?: {
      durationHours?: number;
      baseFee?: number;
      overnightFee?: number;
      exceptionSurcharge?: number;
      lostCardFee?: number;
    };
    paymentStatus?: string;
    rawCheckInTime?: string;
  };
}

const calculateDuration = (checkInTime: string) => {
  const diff = Date.now() - new Date(checkInTime).getTime();
  if (diff < 0) return '0p';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts = [];
  if (days > 0) parts.push(`${days} ngày`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}p`);
  
  return parts.join(' ');
};

export default function CheckOutConfirmPanel({ data }: CheckOutConfirmPanelProps) {
  const {
    ticketCode = "—",
    plateIn = "—",
    plateOut = "—",
    checkInTime = "—",
    checkOutTime = "—",
    checkInDate = "—",
    checkOutDate = "—",
    gateIn = "—",
    gateOut = "—",
    fee = 0,
    feeDetails,
    paymentStatus = "—",
    rawCheckInTime
  } = data || {};

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] px-5 py-3 h-full min-h-0 overflow-hidden">
      {/* Header nhỏ gọn */}
      <div className="flex items-center gap-1.5 mb-3 shrink-0">
        <CheckCircle2 className="text-[#1d7a4a] w-4 h-4" />
        <h2 className="text-[14px] font-bold text-[#060606]">Xác Nhận Xe Ra</h2>
      </div>

      {/* Layout ngang: 2 phần — Info bên trái, Tiền bên phải */}
      <div className="bg-[#f9faf9] rounded-[8px] border border-[#e8e9e8] px-4 py-3 flex-1 min-h-0 overflow-hidden flex gap-6">
        {/* Cột trái: 9 trường thông tin dạng 3 cột */}
        <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2 text-[12px] content-center">
          {/* Row 1 */}
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Mã vé:</span>
            <span className="font-semibold text-[#060606] truncate">{ticketCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Biển số (Vào):</span>
            <span className="font-bold text-[#6b6b6b] font-mono text-[13px] uppercase">{plateIn}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Biển số (Ra):</span>
            <span className="font-bold text-[#060606] font-mono text-[13px] uppercase">{plateOut}</span>
          </div>
          
          {/* Row 2 */}
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Giờ vào:</span>
            <span className="font-semibold text-[#6b6b6b]">{checkInTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Ngày vào:</span>
            <span className="font-semibold text-[#6b6b6b]">{checkInDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Cổng vào:</span>
            <span className="font-semibold text-[#6b6b6b] truncate">{gateIn}</span>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Giờ ra:</span>
            <span className="font-semibold text-[#060606]">{checkOutTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Ngày ra:</span>
            <span className="font-semibold text-[#060606]">{checkOutDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Cổng ra:</span>
            <span className="font-semibold text-[#060606] truncate">{gateOut}</span>
          </div>
        </div>

        {/* Divider dọc */}
        <div className="w-px bg-[#e8e9e8] self-stretch shrink-0" />

        {/* Cột phải: Tiền + Trạng thái + Bảng kê */}
        <div className="flex flex-col justify-center items-end text-right min-w-[140px] shrink-0">
          <span className="text-[11px] text-[#6b6b6b] mb-0.5">Tổng tiền (VNĐ):</span>
          <span className="font-bold text-[26px] text-[#060606] leading-none">
            {fee > 0 ? fee.toLocaleString("vi-VN") : "0"} ₫
          </span>
          <span className={`text-[12px] font-semibold mt-1 ${paymentStatus === "Đã thanh toán" ? "text-[#1d7a4a]" : "text-[#b03030]"}`}>
            {paymentStatus}
          </span>
          {/* Bảng kê chi tiết phí (nhỏ gọn) */}
          <div className="mt-2 text-[10px] text-[#6b6b6b] space-y-0.5 text-right">
            {(rawCheckInTime || feeDetails?.durationHours !== undefined) && (
              <div>Thời gian: <span className="font-medium text-[#060606]">{rawCheckInTime ? calculateDuration(rawCheckInTime) : `${feeDetails?.durationHours}h`}</span></div>
            )}
            {feeDetails?.baseFee !== undefined && (
                <div>Cơ bản: <span className="font-medium text-[#060606]">{feeDetails.baseFee.toLocaleString("vi-VN")}₫</span></div>
              )}
              {!!feeDetails?.overnightFee && (
                <div>Qua đêm: <span className="font-medium text-[#b45309]">{feeDetails.overnightFee.toLocaleString("vi-VN")}₫</span></div>
              )}
              {!!feeDetails?.exceptionSurcharge && (
                <div>Phụ phí: <span className="font-medium text-[#b03030]">{feeDetails.exceptionSurcharge.toLocaleString("vi-VN")}₫</span></div>
              )}
              {!!feeDetails?.lostCardFee && (
                <div>Mất thẻ: <span className="font-medium text-[#b03030]">{feeDetails.lostCardFee.toLocaleString("vi-VN")}₫</span></div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
