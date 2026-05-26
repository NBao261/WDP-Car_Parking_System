import { CheckCircle2 } from "lucide-react";

interface CheckOutConfirmPanelProps {
  data?: {
    ticketCode?: string;
    plateIn?: string;
    plateOut?: string;
    checkInTime?: string;
    checkOutTime?: string;
    gateOut?: string;
    fee?: number;
    paymentStatus?: string;
  };
}

export default function CheckOutConfirmPanel({ data }: CheckOutConfirmPanelProps) {
  const {
    ticketCode = "Không có dữ liệu",
    plateIn = "Không có dữ liệu",
    plateOut = "Không có dữ liệu",
    checkInTime = "Không có dữ liệu",
    checkOutTime = "Không có dữ liệu",
    gateOut = "Không có dữ liệu",
    fee = 0,
    paymentStatus = "Không có dữ liệu"
  } = data || {};

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] p-5 h-full min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <CheckCircle2 className="text-[#1d7a4a] w-6 h-6" />
        <h2 className="text-xl font-bold text-[#060606]">Xác Nhận Xe Ra</h2>
      </div>
      
      <div className="bg-[#f9faf9] p-4 rounded-[8px] border border-[#e8e9e8] flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-y-4 text-[13px]">
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Mã vé (Ticket ID):</span>
            <span className="font-semibold text-[#060606]">{ticketCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Cổng ra:</span>
            <span className="font-semibold text-[#060606]">{gateOut}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Biển số (Vào):</span>
            <span className="font-bold text-[#6b6b6b] font-mono text-[16px] uppercase">{plateIn}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Biển số (Ra):</span>
            <span className="font-bold text-[#060606] font-mono text-[16px] uppercase">{plateOut}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Giờ vào:</span>
            <span className="font-semibold text-[#6b6b6b]">{checkInTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Giờ ra:</span>
            <span className="font-semibold text-[#060606]">{checkOutTime}</span>
          </div>
          
          <div className="col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-[#e8e9e8]">
            <div className="flex flex-col">
              <span className="text-[#6b6b6b] mb-1">Trạng thái TT:</span>
              <span className={`font-semibold ${paymentStatus === 'Đã thanh toán' ? 'text-[#1d7a4a]' : 'text-[#b03030]'}`}>
                {paymentStatus}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[#6b6b6b] mb-1">Tổng tiền (VNĐ):</span>
              <span className="font-bold text-[22px] text-[#060606]">{fee > 0 ? fee.toLocaleString('vi-VN') : '0'} ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
