import { Building2, DoorOpen } from "lucide-react";

interface CheckInHeaderProps {
  facilityName: string;
  gateIn: string;
  checkInImage: string | null;
  ocrSuccess: boolean;
}

export function CheckInHeader({ facilityName, gateIn, checkInImage, ocrSuccess }: CheckInHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-[20px] shrink-0">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-md border border-[#9FE870]/50 bg-[#f0f9e8] flex items-center justify-center text-[#9FE870] shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-[14px] font-bold text-[#060606] uppercase leading-tight tracking-tight truncate">Đăng Ký Xe Vào</h2>
          <div className="flex items-center gap-1.5 text-[10px] text-[#888] font-medium mt-0.5 whitespace-nowrap overflow-hidden">
            <span className="flex items-center gap-1 truncate"><Building2 className="w-3 h-3 text-[#aaa] shrink-0" /> <span className="truncate">Tòa nhà: {facilityName}</span></span>
            <span className="text-[#ccc] shrink-0">|</span>
            <span className="flex items-center gap-1 truncate"><DoorOpen className="w-3 h-3 text-[#aaa] shrink-0" /> <span className="truncate">Cổng: {gateIn}</span></span>
          </div>
        </div>
      </div>

      <div className="flex-none ml-3">
        <div className={`h-7 px-3 rounded-[4px] text-[12px] font-bold flex items-center justify-center transition-colors ${checkInImage && !ocrSuccess
          ? 'bg-[#fdebea] text-[#d32f2f] border border-[#d32f2f]'
          : ocrSuccess
            ? 'bg-[#e8f5e9] text-[#1d7a4a] border border-[#a3c965]'
            : 'bg-[#f9f9f9] text-[#888] border border-[#e8e9e8]'
          }`}>
          {checkInImage && !ocrSuccess ? '● Không nhận diện được' : (ocrSuccess ? '✓ Quét thành công' : '● Chưa quét')}
        </div>
      </div>
    </div>
  );
}
