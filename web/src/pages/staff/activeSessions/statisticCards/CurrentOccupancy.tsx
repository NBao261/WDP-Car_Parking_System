import { Car } from 'lucide-react';

export default function CurrentOccupancy({ count = 0 }: { count?: number }) {
  return (
    <div className="bg-[#9FE870] rounded-xl px-4 lg:px-5 py-3 shadow-[0px_4px_15px_rgba(159,232,112,0.3)] flex items-center justify-between h-full gap-2">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-[#062F28] text-[#9FE870] shrink-0">
          <Car className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <span className="text-[18px] lg:text-[20px] text-[#062F28] font-bold truncate">Trong hầm hiện tại</span>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-[#062F28]/60 font-bold uppercase tracking-wider mb-0.5">Số lượng</div>
        <div className="text-[28px] font-bold text-[#062F28] leading-none">
          {count}
        </div>
      </div>
    </div >
  );
}
