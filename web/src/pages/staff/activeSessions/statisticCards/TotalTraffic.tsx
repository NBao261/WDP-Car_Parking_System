import { ArrowRightLeft } from 'lucide-react';

interface TotalTrafficProps {
  trafficIn?: number;
  trafficOut?: number;
}

export default function TotalTraffic({ trafficIn = 0, trafficOut = 0 }: TotalTrafficProps) {
  return (
    <div className="bg-white rounded-xl px-5 py-3 border border-gray-200 shadow-[0px_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#9FE870] text-[#062F28]">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <span className="text-[20px] text-[#062F28] font-bold">Lưu lượng hôm nay</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-[10px] text-[#062F28]/60 font-bold uppercase tracking-wider mb-0.5">Xe vào</div>
          <div className="text-[22px] font-bold text-[#062F28] leading-none">{trafficIn}</div>
        </div >
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-[10px] text-[#062F28]/60 font-bold uppercase tracking-wider mb-0.5">Xe ra</div>
          <div className="text-[22px] font-bold text-[#062F28] leading-none">{trafficOut}</div>
        </div >
      </div >
    </div >
  );
}
