import { useState, useEffect, useCallback } from 'react';
import {
  Car,
  TrendingUp,
  ParkingSquare,
  Clock,
  Download,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';
import { userService } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import { User, AssignedFacility } from '../../types/user.types';
import { UserRole } from '../../../../shared/types';
import {
  reportService,
  TrafficReportData,
  RevenueReportData,
  OccupancyReportData,
  PeakHoursReportData,
} from '../../services/report.service';
import { toast } from 'sonner';

import { FacilityListWidget } from './components/FacilityListWidget';
import { DashboardCharts } from './components/DashboardCharts';
import { OccupancyDonutWidget } from './components/OccupancyDonutWidget';
import { AIChatWidget } from './components/AIChatWidget';
import { CustomDropdown } from '../../components/ui/CustomDropdown';

/* ── Helpers ─────────────────────────────────────────────── */

function getDateRange(filter: string): {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
} {
  const now = new Date();
  const endDate = now.toISOString();
  switch (filter) {
    case 'today': {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: s.toISOString(), endDate, groupBy: 'day' };
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: s.toISOString(), endDate, groupBy: 'day' };
    }
    case 'year': {
      const s = new Date(now.getFullYear(), 0, 1);
      return { startDate: s.toISOString(), endDate, groupBy: 'month' };
    }
    case 'week':
    default: {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      s.setHours(0, 0, 0, 0);
      return { startDate: s.toISOString(), endDate, groupBy: 'day' };
    }
  }
}

const TIME_LABELS: Record<string, string> = {
  today: 'Hôm nay',
  week: '7 ngày qua',
  month: 'Tháng này',
  year: 'Năm nay',
};

/* ── Quick Stat Card ─────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
}

function StatCard({ label, value, icon, iconBg, loading }: StatCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-[#e5e7eb] p-5 flex items-center gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* tonal circle decoration */}
      <div className={`absolute -right-3 -top-3 w-14 h-14 rounded-full opacity-20 ${iconBg}`} />
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="z-10 min-w-0">
        <p className="text-[13px] text-[#6b7280] font-medium truncate">{label}</p>
        <p className="text-[36px] leading-tight font-bold text-[#1a1a1a] tracking-tight">
          {loading ? (
            <Loader2 size={20} className="animate-spin mt-2" style={{ color: '#d7ee46' }} />
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────── */

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const managerFacilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

  const [timeFilter, setTimeFilter] = useState('today');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const [staffList, setStaffList] = useState<User[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficReportData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyReportData | null>(null);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  /* ── Fetch Staff ── */
  const fetchStaff = useCallback(async () => {
    try {
      const res = await userService.getAllUsers({ role: UserRole.STAFF, limit: 100 });
      setStaffList(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    }
  }, []);

  /* ── Fetch Dashboard Data ── */
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const { startDate, endDate, groupBy } = getDateRange(timeFilter);
    const facilityId = facilityFilter !== 'all' ? facilityFilter : undefined;
    try {
      const [trafficRes, revenueRes, occupancyRes, peakRes] = await Promise.allSettled([
        reportService.getTrafficReport({ startDate, endDate, groupBy, facilityId }),
        reportService.getRevenueReport({ startDate, endDate, groupBy, facilityId }),
        reportService.getOccupancyReport({ facilityId }),
        reportService.getPeakHoursReport({ startDate, endDate, facilityId }),
      ]);
      setTrafficData(trafficRes.status === 'fulfilled' ? trafficRes.value.data : null);
      setRevenueData(revenueRes.status === 'fulfilled' ? revenueRes.value.data : null);
      setOccupancyData(occupancyRes.status === 'fulfilled' ? occupancyRes.value.data : null);
      setPeakHoursData(peakRes.status === 'fulfilled' ? peakRes.value.data : null);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, facilityFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* ── Export ── */
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setExporting(true);
      toast.info(`Đang xuất báo cáo tổng hợp ra ${format === 'pdf' ? 'PDF' : 'Excel'}...`);
      const { startDate, endDate, groupBy } = getDateRange(timeFilter);
      const facilityId = facilityFilter !== 'all' ? facilityFilter : undefined;
      const blob = await reportService.exportReport({
        reportType: 'comprehensive',
        format,
        startDate,
        endDate,
        groupBy,
        facilityId,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao_cao_tong_hop_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất báo cáo thành công!');
    } catch (err) {
      toast.error('Lỗi xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  /* ── Computed values ── */
  const totalTraffic = trafficData
    ? (trafficData.summary.totalCheckIn + trafficData.summary.totalCheckOut).toLocaleString('vi-VN')
    : '--';
  const totalRevenue = revenueData
    ? revenueData.summary.grandTotal.toLocaleString('vi-VN') + 'đ'
    : '--';
  const occupancyRate = occupancyData ? occupancyData.summary.overallOccupancyRate + '%' : '--';
  // Lấy số xe đang đỗ thực tế từ occupancy (real-time) thay vì ước tính từ traffic
  const currentlyParked = occupancyData
    ? occupancyData.summary.totalOccupied.toLocaleString('vi-VN')
    : '--';

  /* ── Render ── */
  return (
    <div className="min-h-screen">
      {/* ═══ HEADER BAR ═══ */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[#1a1a1a] font-bold text-[22px] tracking-tight">Tổng quan</h1>
            <p className="text-[13px] text-[#6b7280] mt-0.5">
              Theo dõi và phân tích các chỉ số hoạt động của bãi đỗ xe
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Filter */}
          <CustomDropdown
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={[
              { label: 'Tất cả tòa nhà', value: 'all' },
              ...managerFacilities.map((f) => ({ label: f.name, value: f._id })),
            ]}
          />

          {/* Time Filter */}
          <CustomDropdown
            value={timeFilter}
            onChange={setTimeFilter}
            options={Object.entries(TIME_LABELS).map(([value, label]) => ({ label, value }))}
          />

          {/* Export Buttons */}
          <div className="flex gap-[12px]">
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting || loading}
              className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-[10px] bg-white border-[1.5px] border-gray-200 text-[#1a1a1a] text-[14px] font-medium hover:opacity-[0.88] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 size={17} className="animate-spin" /> : <FileSpreadsheet size={17} />}
              Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting || loading}
              className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-[10px] bg-[#d7ee46] text-[#060606] border-none text-[14px] font-medium hover:opacity-[0.88] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* ═══ CONTENT ═══ */}
      <div className="space-y-4">
        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Lượt ra/vào"
            value={totalTraffic}
            icon={<Car size={22} className="text-[#060606]" />}
            iconBg="bg-[#d7ee46]"
            loading={loading}
          />
          <StatCard
            label="Doanh thu"
            value={totalRevenue}
            icon={<TrendingUp size={22} className="text-white" />}
            iconBg="bg-[#22c55e]"
            loading={loading}
          />
          <StatCard
            label="Tỷ lệ lấp đầy"
            value={occupancyRate}
            icon={<ParkingSquare size={22} className="text-white" />}
            iconBg="bg-[#3b82f6]"
            loading={loading}
          />
          <StatCard
            label="Xe đang gửi"
            value={currentlyParked}
            icon={<Clock size={22} className="text-white" />}
            iconBg="bg-[#f97316]"
            loading={loading}
          />
        </div>

        {/* ── Main Grid: 2/3 + 1/3 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2/3 */}
          <div className="lg:col-span-2">
            <DashboardCharts
              trafficData={trafficData}
              revenueData={revenueData}
              peakHoursData={peakHoursData}
              occupancyData={occupancyData}
              loading={loading}
            />
          </div>

          {/* Right 1/3 */}
          <div className="flex flex-col gap-4">
            <OccupancyDonutWidget occupancyData={occupancyData} />
            <div className="flex-1 min-h-0">
              <FacilityListWidget managerFacilities={managerFacilities} staffList={staffList} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating AI Chatbot ── */}
      <AIChatWidget />
    </div>
  );
}
