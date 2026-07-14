import { Map } from 'lucide-react';
import { OccupancyReportData } from '../../../../services/report.service';

interface Props {
  occupancyData: OccupancyReportData | null;
}

export function FacilityLeaderboardWidget({ occupancyData }: Props) {
  const floors = occupancyData?.floors || [];
  
  // Sort by highest occupancy rate
  const sortedFloors = [...floors].sort((a, b) => {
    const rateA = (a.occupied + a.reserved) / a.total;
    const rateB = (b.occupied + b.reserved) / b.total;
    return rateB - rateA;
  });

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#062F28]/5 flex items-center justify-center shrink-0">
          <Map size={16} className="text-[#062F28]" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Hiện trạng khu vực</h2>
          <p className="text-[12px] text-[#6b7280]">Tỷ lệ lấp đầy theo từng phân khu</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-1">
        <div className="flex flex-col gap-3">
          {sortedFloors.length > 0 ? (
            sortedFloors.map((floor) => {
              const total = floor.total > 0 ? floor.total : 1; // prevent div by zero
              const rate = ((floor.occupied + floor.reserved) / total) * 100;
              return (
                <div key={floor.facilityId} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-bold text-[#1a1a1a] truncate">{floor.facilityName}</span>
                      <span className="text-[12px] font-semibold text-[#062F28] tabular-nums">{rate.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${rate >= 90 ? 'bg-rose-500' : rate >= 70 ? 'bg-amber-500' : 'bg-[#9FE870]'}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[11px] text-[#6b7280]">
                      <span><strong className="text-[#1a1a1a]">{floor.occupied}</strong> đang dùng</span>
                      <span><strong className="text-[#1a1a1a]">{floor.available}</strong> chỗ trống</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-6 text-[13px] text-gray-500">Chưa có dữ liệu phân khu</div>
          )}
        </div>
      </div>
    </div>
  );
}
