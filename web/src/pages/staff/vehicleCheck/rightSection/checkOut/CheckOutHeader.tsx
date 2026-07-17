import { Building2, DoorOpen } from 'lucide-react';

export function CheckOutHeader({ building, gateOut, currentSession }: any) {
  return (
    <div className="flex justify-between items-center mb-6 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-md border border-[#062F28] bg-[#062F28] flex items-center justify-center text-[#9FE870] shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-bold text-[#060606] uppercase leading-tight tracking-tight truncate">
            Đăng Ký Xe Ra
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#888] font-medium mt-1 whitespace-nowrap overflow-hidden">
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#aaa] shrink-0" />{' '}
              <span className="truncate">Tòa nhà: {building}</span>
            </span>
            <span className="text-[#ccc] shrink-0">|</span>
            <span className="flex items-center gap-1.5 truncate">
              <DoorOpen className="w-3.5 h-3.5 text-[#aaa] shrink-0" />{' '}
              <span className="truncate">Cổng: {gateOut}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex-none ml-3">
        <div
          className={`h-9 px-4 rounded-md text-[13px] font-bold flex items-center justify-center transition-colors ${currentSession ? 'bg-[#ECFCCB] text-[#1A202C] border border-[#A3E635]' : 'bg-[#f9f9f9] text-[#888] border border-[#e8e9e8]'}`}
        >
          {currentSession ? '✓ Đã tìm thấy vé' : '● Chưa quét'}
        </div>
      </div>
    </div>
  );
}
