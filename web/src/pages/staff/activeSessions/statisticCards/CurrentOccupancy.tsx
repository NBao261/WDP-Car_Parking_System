import { Car } from 'lucide-react';

export default function CurrentOccupancy({ count = 0 }: { count?: number }) {
  return (
    <div className="bg-[#062F28] rounded-xl px-5 py-3 border border-[#062F28] flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#9FE870]/20 text-[#9FE870]">
          <Car className="w-4 h-4" />
        </div>
        <span className="text-[13px] text-[#9FE870]/80 font-semibold">Trong hầm hiện tại</span>
      </div>
      <div className="text-[28px] font-bold text-[#9FE870] leading-none">
        {count}
      </div>
    </div >
  );
}
