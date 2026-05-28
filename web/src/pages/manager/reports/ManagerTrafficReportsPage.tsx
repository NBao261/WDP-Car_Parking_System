import { useState, useEffect, useCallback } from 'react';
import { Download, Car, ArrowUpDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  reportService,
  TrafficReportResponse,
  PeakHoursReportResponse,
  OccupancyReportResponse,
  ReportGroupBy,
} from '../../../services/report.service';
import { StatCard } from '../../../components/ui/StatCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ReportFilterBar } from './components/ReportFilterBar';
import { DateRange } from '../components/DateRangePicker';

function getDefaultRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
}

export default function ManagerTrafficReportsPage() {
  const [facilityId, setFacilityId] = useState('');
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('day');
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());

  const [traffic, setTraffic] = useState<TrafficReportResponse | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursReportResponse | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        facilityId: facilityId || undefined,
        groupBy,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      const [trafficRes, peakRes, occRes] = await Promise.all([
        reportService.getTrafficReport(params),
        reportService.getPeakHoursReport({ facilityId: facilityId || undefined, startDate: dateRange.startDate, endDate: dateRange.endDate }),
        reportService.getOccupancyReport({ facilityId: facilityId || undefined }),
      ]);
      if (trafficRes.success) setTraffic(trafficRes.data);
      if (peakRes.success) setPeakHours(peakRes.data);
      if (occRes.success) setOccupancy(occRes.data);
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo lưu lượng');
    } finally {
      setLoading(false);
    }
  }, [facilityId, groupBy, dateRange]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const trafficData = traffic?.data ?? [];
  const peakData = (peakHours?.hourlyDistribution ?? []).filter(h => h.hour >= 6 && h.hour <= 22);
  const floorOccData = occupancy?.floors ?? [];
  const occSummary = occupancy?.summary;
  const trafficSummary = traffic?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Lưu Lượng"
        description="Phân tích lượt xe vào/ra, giờ cao điểm và tỷ lệ lấp đầy"
        actions={
          <button className="flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] font-semibold text-[13px] px-4 h-[38px] rounded-lg hover:bg-[#f5f5f4] transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
        }
      />

      <ReportFilterBar
        facilityId={facilityId}
        onFacilityChange={setFacilityId}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-[#e8e9e8] p-5 animate-pulse h-24" />)}
          </div>
          <div className="bg-white rounded-xl border border-[#e8e9e8] p-6">
            <LoadingState rows={8} cols={3} />
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Tổng Lượt Vào" value={(trafficSummary?.totalCheckIn ?? 0).toLocaleString()} icon={<Car size={18} />} />
            <StatCard label="Tổng Lượt Ra" value={(trafficSummary?.totalCheckOut ?? 0).toLocaleString()} icon={<ArrowUpDown size={18} />} />
            <StatCard label="Đang Trong Bãi" value={(trafficSummary?.currentlyParked ?? 0).toLocaleString()} icon={<TrendingUp size={18} />}
              sub={occSummary ? `(${occSummary.overallOccupancyRate}% lấp đầy)` : undefined}
            />
          </div>

          {/* Traffic Trend */}
          <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
            <h3 className="font-bold text-[#060606] mb-5">Xu Hướng Lưu Lượng Xe</h3>
            {trafficData.length === 0 ? <EmptyState /> : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ left: -10, right: 0, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d7ee46" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#d7ee46" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#6b6b6b' }}>{v}</span>} />
                    <Area type="monotone" dataKey="checkIn" stroke="#1a1a1a" strokeWidth={2} fill="url(#colorIn)" name="Xe vào" />
                    <Area type="monotone" dataKey="checkOut" stroke="#a3b822" strokeWidth={2} fill="url(#colorOut)" name="Xe ra" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Peak Hours + Floor Occupancy */}
          <div className="grid grid-cols-2 gap-4">
            {/* Peak Hours */}
            <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
              <h3 className="font-bold text-[#060606] mb-1">Phân Bố Hoạt Động Theo Giờ</h3>
              {peakHours && (
                <p className="text-[12px] text-[#a0a0a0] mb-4">
                  Cao điểm: {peakHours.summary.peakHours.slice(0, 2).map(h => h.label.split(' ')[0]).join(', ')}
                </p>
              )}
              {peakData.length === 0 ? <EmptyState /> : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakData} margin={{ left: -15, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 10 }}
                        tickFormatter={(h) => `${String(h).padStart(2, '0')}h`} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 10 }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                        labelFormatter={(h) => `${String(h).padStart(2, '0')}:00`} />
                      <Bar dataKey="totalActivity" fill="#d7ee46" radius={[3, 3, 0, 0]} maxBarSize={20} name="Hoạt động" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Floor Occupancy */}
            <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
              <h3 className="font-bold text-[#060606] mb-1">Tỷ Lệ Lấp Đầy Theo Tầng</h3>
              {occSummary && (
                <p className="text-[12px] text-[#a0a0a0] mb-4">
                  Tổng thể: {occSummary.overallOccupancyRate}% | Hiệu quả: {occSummary.effectiveOccupancyRate}%
                </p>
              )}
              {floorOccData.length === 0 ? (
                <EmptyState description="Chưa có dữ liệu lấp đầy" />
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {floorOccData.map((f) => (
                    <div key={f.floorId}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="font-medium text-[#060606]">{f.floorName}</span>
                        <span className={`font-bold ${f.occupancyRate > 90 ? 'text-[#ef4444]' : f.occupancyRate > 70 ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>
                          {f.occupancyRate}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#e8e9e8] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${f.occupancyRate > 90 ? 'bg-[#ef4444]' : f.occupancyRate > 70 ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'}`}
                          style={{ width: `${f.occupancyRate}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#a0a0a0] mt-0.5">{f.occupied}/{f.total} slot</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
