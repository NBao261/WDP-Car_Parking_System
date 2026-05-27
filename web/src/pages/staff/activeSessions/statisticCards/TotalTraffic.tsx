import { ArrowRightLeft } from "lucide-react";

export default function TotalTraffic() {
  const xeVao = 142;
  const xeRa = 98;

  return (
    <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#060606]/5 text-[#060606]">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <span className="text-[13px] text-[#060606]/60 font-semibold">Lưu lượng hôm nay</span>
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
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex gap-1.5">
          <button className="px-3 py-1 rounded-md bg-[#060606] text-white text-[11px] font-semibold">Tất cả</button>
          <button className="px-3 py-1 rounded-md bg-white border border-gray-200 text-[#060606] text-[11px] font-medium hover:bg-gray-50">Ô tô</button>
          <button className="px-3 py-1 rounded-md bg-white border border-gray-200 text-[#060606] text-[11px] font-medium hover:bg-gray-50">Xe máy</button>
        </div>
      </div>
    </div>
  );
}
