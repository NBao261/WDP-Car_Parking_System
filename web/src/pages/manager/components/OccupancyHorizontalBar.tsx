import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { OccupancyReportData } from '../../../services/report.service';

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload[0]?.payload?._total;
  return (
    <div className="bg-[#060606] rounded-xl px-4 py-3 shadow-xl border border-white/10 min-w-[140px]">
      <p className="text-[11px] text-white/50 mb-2 font-medium tracking-wide uppercase">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <span className="flex items-center gap-1.5 text-[12px] text-white/70">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: entry.color }}
            />
            {entry.name}
          </span>
          <span className="text-[13px] font-semibold text-white tabular-nums">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('vi-VN') : entry.value}
          </span>
        </div>
      ))}
      {typeof total === 'number' && (
        <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-white/10">
          <span className="text-[12px] text-white/70 font-medium">Tổng chỗ</span>
          <span className="text-[13px] font-bold text-white tabular-nums">
            {total.toLocaleString('vi-VN')}
          </span>
        </div>
      )}
    </div>
  );
};

interface OccupancyHorizontalBarProps {
  occupancyData: OccupancyReportData | null;
  loading: boolean;
}

export function OccupancyHorizontalBar({ occupancyData, loading }: OccupancyHorizontalBarProps) {
  const chartData = (() => {
    if (!occupancyData?.floors?.length) return [];
    const facilityMap = new Map<
      string,
      { name: string; 'Đang dùng': number; 'Đã đặt': number; 'Chỗ trống': number; 'Bảo trì': number; _total: number }
    >();

    for (const floor of occupancyData.floors) {
      const existing = facilityMap.get(floor.facilityId);
      if (existing) {
        existing['Đang dùng'] += floor.occupied;
        existing['Đã đặt'] += floor.reserved;
        existing['Chỗ trống'] += floor.available;
        existing['Bảo trì'] += floor.maintenance + floor.locked;
        existing._total += floor.total;
      } else {
        facilityMap.set(floor.facilityId, {
          name: floor.facilityName,
          'Đang dùng': floor.occupied,
          'Đã đặt': floor.reserved,
          'Chỗ trống': floor.available,
          'Bảo trì': floor.maintenance + floor.locked,
          _total: floor.total,
        });
      }
    }
    return Array.from(facilityMap.values());
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
          <Loader2 size={24} className="animate-spin text-[#86cd3d]" />
        </div>
      )}

      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-[16px] font-bold text-gray-900">Trạng thái chỗ đỗ</h2>
        <p className="text-[12px] text-gray-400 mt-0.5">Phân bổ theo từng tòa nhà</p>
      </div>

      <div className="flex-1 px-3 pb-3 min-h-0">
        {chartData.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-gray-400">Chưa có dữ liệu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                width={110}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f3', opacity: 0.6 }} />
              <Legend
                verticalAlign="top"
                height={28}
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#6b7280', paddingLeft: '110px' }}
              />
              <Bar dataKey="Đang dùng" stackId="a" fill="#0a2012" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Đã đặt" stackId="a" fill="#86cd3d" />
              <Bar dataKey="Bảo trì" stackId="a" fill="#9ca3af" />
              <Bar dataKey="Chỗ trống" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
