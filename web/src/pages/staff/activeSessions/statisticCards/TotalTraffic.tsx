import { ArrowRightLeft } from "lucide-react";

export default function TotalTraffic() {
  const xeVao = 142;
  const xeRa = 98;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[15px] text-[#060606]/80 font-bold">Lưu lượng (Hôm nay)</span>
        <div className="p-1.5 rounded-lg bg-gray-50 text-[#060606]">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-end w-full gap-8 mb-1">
        <div className="flex-1">
          <div className="text-[11px] text-[#060606]/50 font-semibold uppercase tracking-wider mb-2">Tổng Xe Vào</div>
          <div className="text-[40px] font-bold text-[#060606] leading-none">{xeVao}</div>
        </div>

        <div className="w-px h-12 bg-gray-200 self-center"></div>

        <div className="flex-1">
          <div className="text-[11px] text-[#060606]/50 font-semibold uppercase tracking-wider mb-2">Tổng Xe Ra</div>
          <div className="text-[40px] font-bold text-[#060606] leading-none">{xeRa}</div>
        </div>
      </div>

      <div className="absolute opacity-0 pointer-events-none">
        {/* Hidden filter buttons to keep component clean if they aren't needed in the exact layout, but keeping them rendered just in case they were meant to be in this card. In the user's latest image, the filter buttons were moved to be floating under the 142. I'll put them in a small div below if space allows, but since height is 160px, it's tight. */}
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <button className="px-4 py-1.5 rounded-lg bg-[#060606] text-white text-xs font-semibold">Tất cả</button>
        <button className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-[#060606] text-xs font-medium hover:bg-gray-50">Ô tô</button>
        <button className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-[#060606] text-xs font-medium hover:bg-gray-50">Xe máy</button>
      </div>
    </div>
  );
}
