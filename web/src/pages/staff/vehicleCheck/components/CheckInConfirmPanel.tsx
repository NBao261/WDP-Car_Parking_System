import { CheckCircle2 } from "lucide-react";

interface CheckInConfirmPanelProps {
  data?: {
    ticketCode?: string;
    plate?: string;
    vehicleType?: string;
    checkInTime?: string;
    gate?: string;
    zone?: string;
  };
}

export default function CheckInConfirmPanel({ data }: CheckInConfirmPanelProps) {
  const {
    ticketCode = "Không có dữ liệu",
    plate = "Không có dữ liệu",
    vehicleType = "Không có dữ liệu",
    checkInTime = "Không có dữ liệu",
    gate = "Không có dữ liệu",
    zone = "Không có dữ liệu"
  } = data || {};

  return (
    <div className="flex flex-col bg-white rounded-[16px] border border-[#e8e9e8] p-5 h-full min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <CheckCircle2 className="text-[#1d7a4a] w-6 h-6" />
        <h2 className="text-xl font-bold text-[#060606]">Xác Nhận Xe Vào</h2>
      </div>
      
      <div className="bg-[#f9faf9] p-4 rounded-[8px] border border-[#e8e9e8] flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-y-4 text-[13px]">
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Mã vé (Ticket ID):</span>
            <span className="font-semibold text-[#060606]">{ticketCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Biển số xe:</span>
            <span className="font-bold text-[#060606] font-mono text-[16px] uppercase">{plate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Loại xe:</span>
            <span className="font-semibold text-[#060606]">{vehicleType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Giờ vào:</span>
            <span className="font-semibold text-[#060606]">{checkInTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Cổng vào:</span>
            <span className="font-semibold text-[#060606]">{gate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#6b6b6b] mb-1">Khu vực / Tầng:</span>
            <span className="font-semibold text-[#060606]">{zone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
