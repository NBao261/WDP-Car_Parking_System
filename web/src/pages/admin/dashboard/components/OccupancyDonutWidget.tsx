import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { OccupancyReportData } from '../../../../services/report.service';

interface OccupancyDonutWidgetProps {
  occupancyData: OccupancyReportData | null;
}

/* Semantic colors */
const SEGMENTS = [
  { key: 'available', name: 'Chỗ trống', color: '#22c55e' },
  { key: 'reserved', name: 'Đã đặt', color: '#3b82f6' },
  { key: 'occupied', name: 'Đang dùng', color: '#f97316' },
  { key: 'maintenance', name: 'Bảo trì', color: '#9ca3af' },
];

export function OccupancyDonutWidget({ occupancyData }: OccupancyDonutWidgetProps) {
  const totalMaintenance = occupancyData?.floors?.reduce(
    (sum, f) => sum + (f.maintenance || 0) + (f.locked || 0), 0
  ) || 0;

  const pieData = occupancyData?.summary
    ? [
        { name: 'Chỗ trống', value: occupancyData.summary.totalAvailable },
        { name: 'Đã đặt', value: occupancyData.summary.totalReserved },
        { name: 'Đang dùng', value: occupancyData.summary.totalOccupied },
        { name: 'Bảo trì', value: totalMaintenance },
      ].filter((item) => item.value > 0)
    : [];

  const totalSlots = occupancyData?.summary.totalSlots || 0;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex flex-col">
      <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">Trạng thái chỗ đỗ</h2>

      <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
        {pieData.length === 0 ? (
          <div className="text-[#6b7280] text-[13px]">Chưa có dữ liệu</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => {
                    const seg = SEGMENTS.find((s) => s.name === entry.name);
                    return <Cell key={`cell-${index}`} fill={seg?.color || '#9ca3af'} />;
                  })}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '12px',
                    backgroundColor: '#060606',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-[28px] font-bold text-[#1a1a1a] leading-none">
                {totalSlots.toLocaleString('vi-VN')}
              </span>
              <span className="text-[12px] text-[#6b7280] mt-0.5">Tổng chỗ</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
