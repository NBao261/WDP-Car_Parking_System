import { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import {
  TrafficReportData,
  RevenueReportData,
  PeakHoursReportData,
  OccupancyReportData,
} from '../../../services/report.service';

interface DashboardChartsProps {
  trafficData: TrafficReportData | null;
  revenueData: RevenueReportData | null;
  peakHoursData: PeakHoursReportData | null;
  occupancyData: OccupancyReportData | null;
  loading: boolean;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const totalSlots = payload[0]?.payload?._total;
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
            {typeof entry.value === 'number' && entry.name === 'Doanh thu'
              ? entry.value.toLocaleString('vi-VN') + '₫'
              : typeof entry.value === 'number'
                ? entry.value.toLocaleString('vi-VN')
                : entry.value}
          </span>
        </div>
      ))}
      {typeof totalSlots === 'number' && (
        <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-white/10">
          <span className="text-[12px] text-white/70 font-medium">Tổng chỗ</span>
          <span className="text-[13px] font-bold text-white tabular-nums">
            {totalSlots.toLocaleString('vi-VN')}
          </span>
        </div>
      )}
    </div>
  );
};

const TABS = [
  { key: 'overview', label: 'Tổng quan', activeColor: '#22c55e' },
  { key: 'traffic', label: 'Lưu lượng', activeColor: '#d7ee46' },
  { key: 'revenue', label: 'Doanh thu', activeColor: '#3b82f6' },
  { key: 'peakhours', label: 'Cao điểm', activeColor: '#f97316' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function DashboardCharts({
  trafficData,
  revenueData,
  peakHoursData,
  occupancyData,
  loading,
}: DashboardChartsProps) {
  const [activeChart, setActiveChart] = useState<TabKey>('overview');
  const currentTab = TABS.find((t) => t.key === activeChart)!;

  // ── Overview: Occupancy by facility (stacked bar) ──
  const chartOverview = (() => {
    if (!occupancyData?.floors?.length) return [];

    // Gộp floors theo facility
    const facilityMap = new Map<string, { name: string; 'Đang dùng': number; 'Đã đặt': number; 'Chỗ trống': number; 'Bảo trì': number; _total: number }>();

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

  // ── Traffic chart data ──
  let chartTraffic: any[] = [];
  // Nếu dữ liệu traffic chỉ có 1 ngày (vd: Hôm nay), dùng dữ liệu phân bổ theo giờ từ peakHoursData để biểu đồ trực quan hơn
  if (trafficData?.data.length === 1 && peakHoursData?.hourlyDistribution) {
    chartTraffic = peakHoursData.hourlyDistribution.map((item) => ({
      name: `${String(item.hour).padStart(2, '0')}:00`,
      'Xe vào': item.checkIn,
      'Xe ra': item.checkOut,
    }));
  } else {
    chartTraffic =
      trafficData?.data.map((item) => ({
        name: item.label,
        'Xe vào': item.checkIn,
        'Xe ra': item.checkOut,
      })) || [];
    if (chartTraffic.length === 1) {
      chartTraffic = [
        { name: '', 'Xe vào': undefined, 'Xe ra': undefined },
        chartTraffic[0],
        { name: ' ', 'Xe vào': undefined, 'Xe ra': undefined },
      ] as any[];
    }
  }

  let chartRevenue =
    revenueData?.byTimePeriod.map((item) => ({
      name: item.label,
      'Doanh thu': item.totalRevenue,
    })) || [];
  if (chartRevenue.length === 1) {
    chartRevenue = [
      { name: '', 'Doanh thu': undefined },
      chartRevenue[0],
      { name: ' ', 'Doanh thu': undefined },
    ] as any[];
  }

  let chartPeak =
    peakHoursData?.hourlyDistribution.map((item) => ({
      name: `${String(item.hour).padStart(2, '0')}:00`,
      Tổng: item.totalActivity,
    })) || [];
  if (chartPeak.length === 1) {
    chartPeak = [
      { name: '', Tổng: undefined },
      chartPeak[0],
      { name: ' ', Tổng: undefined },
    ] as any[];
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1a1a1a]">Biểu đồ phân tích</h2>
          <p className="text-[13px] text-[#6b7280]">
            {activeChart === 'overview'
              ? 'Phân bổ chỗ đỗ theo tòa nhà thời điểm hiện tại'
              : 'Xu hướng hoạt động theo thời gian'}
          </p>
        </div>
        {/* Toggle pills */}
        <div className="flex bg-[#f5f5f3] p-1 rounded-lg gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className="px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all"
              style={
                activeChart === tab.key
                  ? {
                      backgroundColor: tab.activeColor,
                      color: tab.key === 'traffic' ? '#060606' : '#fff',
                    }
                  : { color: '#6b7280' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-[300px] relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
            <Loader2 size={24} className="animate-spin" style={{ color: currentTab.activeColor }} />
          </div>
        )}

        {/* Overview — Stacked Bar Chart (Occupancy by Facility) */}
        {activeChart === 'overview' &&
          (chartOverview.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-[#bbf7d0]" />
              </div>
              <p className="text-[#9ca3af] text-[13px] font-medium">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartOverview}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dx={-10}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f5f5f3', opacity: 0.6 }}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}
                />
                <Bar dataKey="Đang dùng" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Đã đặt" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Bảo trì" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Chỗ trống" stackId="a" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ))}

        {/* Traffic — Bar Chart */}
        {activeChart === 'traffic' &&
          (chartTraffic.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f3] flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-[#e5e7eb]" />
              </div>
              <p className="text-[#9ca3af] text-[13px] font-medium">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartTraffic}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                barGap={8}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dx={-10}
                  domain={[0, (dataMax: number) => (dataMax === 0 ? 10 : Math.ceil(dataMax * 1.2))]}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f5f5f3', opacity: 0.6 }}
                />
                <Bar dataKey="Xe vào" fill="#d7ee46" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <Bar dataKey="Xe ra" fill="#1a1a1a" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ))}

        {/* Revenue — Area Chart with gradient */}
        {activeChart === 'revenue' &&
          (chartRevenue.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full bg-[#f0f6ff] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#bfdbfe]" />
              </div>
              <p className="text-[#9ca3af] text-[13px] font-medium">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dx={-10}
                  domain={[0, (dataMax: number) => (dataMax === 0 ? 10 : Math.ceil(dataMax * 1.2))]}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
                    : v >= 1_000 ? `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 0)}K`
                    : String(v)
                  }
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="Doanh thu"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ))}

        {/* Peak hours — Bar Chart */}
        {activeChart === 'peakhours' &&
          (chartPeak.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 rounded-full bg-[#fff7ed] flex items-center justify-center">
                <div className="w-6 h-6 rounded-xl bg-[#fed7aa]" />
              </div>
              <p className="text-[#9ca3af] text-[13px] font-medium">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPeak} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dx={-10}
                  domain={[0, (dataMax: number) => (dataMax === 0 ? 10 : Math.ceil(dataMax * 1.2))]}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f5f5f3', opacity: 0.6 }}
                />
                <Bar dataKey="Tổng" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ))}
      </div>
    </div>
  );
}
