import { ArrowRightLeft } from 'lucide-react';

interface TotalTrafficProps {
  trafficIn?: number;
  trafficOut?: number;
}

export default function TotalTraffic({ trafficIn = 0, trafficOut = 0 }: TotalTrafficProps) {
  return (
    <div className="bg-[#062F28] rounded-xl px-5 py-3 border border-[#062F28] flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#9FE870]/20 text-[#9FE870]">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <span className="text-[13px] text-[#9FE870]/80 font-semibold">Lưu lượng hôm nay</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-[10px] text-[#9FE870]/60 font-semibold uppercase tracking-wider mb-0.5">Xe vào</div>
          <div className="text-[22px] font-bold text-[#9FE870] leading-none">{trafficIn}</div>
        </div >
        <div className="w-px h-8 bg-[#9FE870]/20" />
        <div className="text-center">
          <div className="text-[10px] text-[#9FE870]/60 font-semibold uppercase tracking-wider mb-0.5">Xe ra</div>
          <div className="text-[22px] font-bold text-[#9FE870] leading-none">{trafficOut}</div>
        </div >
      </div >
    </div >
  );
}
