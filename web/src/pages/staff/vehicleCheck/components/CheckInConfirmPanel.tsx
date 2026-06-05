import { CheckCircle2 } from "lucide-react";

interface CheckInConfirmPanelProps {
  data?: {
    ticketCode?: string;
    plate?: string;
    vehicleType?: string;
    checkInTime?: string;
    checkInDate?: string;
    gate?: string;
    zone?: string;
  };
}

export default function CheckInConfirmPanel({ data }: CheckInConfirmPanelProps) {
  const {
    ticketCode = "—",
    plate = "—",
    vehicleType = "—",
    checkInTime = "—",
    checkInDate = "—",
    gate = "—",
    zone = "—"
  } = data || {};

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] px-5 py-3 h-full min-h-0 overflow-hidden">
      {/* Header nhỏ gọn */}
      <div className="flex items-center gap-1.5 mb-3 shrink-0">
        <CheckCircle2 className="text-[#1d7a4a] w-4 h-4" />
        <h2 className="text-[14px] font-bold text-[#060606]">Xác Nhận Xe Vào</h2>
      </div>

      {/* 6 trường dữ liệu — layout 3 cột ngang để tiết kiệm chiều cao */}
      <div className="bg-[#f9faf9] rounded-[8px] border border-[#e8e9e8] px-4 py-3 flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-[12px] h-full content-center">
          {/* Row 1 */}
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Mã vé:</span>
            <span className="font-semibold text-[#060606] truncate">{ticketCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Biển số xe:</span>
            <span className="font-bold text-[#060606] font-mono text-[14px] uppercase">{plate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Loại xe:</span>
            <span className="font-semibold text-[#060606] truncate">{vehicleType}</span>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Giờ vào:</span>
            <span className="font-semibold text-[#060606]">{checkInTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Ngày vào:</span>
            <span className="font-semibold text-[#060606]">{checkInDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-0.5">Cổng vào:</span>
            <span className="font-semibold text-[#060606] truncate">{gate}</span>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col col-span-3 pt-1 border-t border-[#e8e9e8]">
            <span className="text-[#6b6b6b] mb-0.5">Khu vực / Tầng:</span>
            <span className="font-semibold text-[#060606] truncate">{zone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
