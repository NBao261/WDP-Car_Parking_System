import { ArrowRightLeft } from "lucide-react";

interface TotalTrafficProps {
  trafficIn?: number;
  trafficOut?: number;
}

export default function TotalTraffic({
  trafficIn = 0,
  trafficOut = 0,
}: TotalTrafficProps) {
  // Use mocked stats for now as requested
  const xeVao = 142;
  const xeRa = 98;

  return (
    <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#060606]/5 text-[#060606]">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <span className="text-[13px] text-[#060606]/60 font-semibold">Lưu lượng hôm nay "CHƯA LÀM"</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-[10px] text-[#060606]/40 font-semibold uppercase tracking-wider mb-0.5">Xe vào</div>
          <div className="text-[22px] font-bold text-[#060606] leading-none">{xeVao}</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center">
          <div className="text-[10px] text-[#060606]/40 font-semibold uppercase tracking-wider mb-0.5">Xe ra</div>
          <div className="text-[22px] font-bold text-[#060606] leading-none">{xeRa}</div>
        </div>
      </div>
    </div>
  );
}
