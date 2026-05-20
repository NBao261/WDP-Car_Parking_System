import { Car } from "lucide-react";

export default function CurrentOccupancy() {
  const xeVao = 142;
  const xeRa = 98;
  const trongHam = xeVao - xeRa;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px]">
      <div className="flex items-start justify-between">
        <span className="text-[15px] text-[#060606]/80 font-bold">Lượng Phương Tiện Trong Hầm</span>
        <div className="p-1.5 rounded-lg bg-gray-50 text-[#060606]">
          <Car className="w-5 h-5" />
        </div>
      </div>
      <div className="text-[40px] font-bold text-[#060606] leading-none mb-1">
        {trongHam}
      </div>
    </div>
  );
}
