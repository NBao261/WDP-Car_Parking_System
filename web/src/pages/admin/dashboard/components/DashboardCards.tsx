import { Car, TrendingUp, ParkingSquare, Receipt, Loader2 } from 'lucide-react';
import { TrafficReportData, RevenueReportData, OccupancyReportData } from '../../../../services/report.service';

interface DashboardCardsProps {
  trafficData: TrafficReportData | null;
  revenueData: RevenueReportData | null;
  occupancyData: OccupancyReportData | null;
  isLoading?: boolean;
}

/* ─── Stat Card — giữ layout Manager nhưng thêm subtitle (Admin-only) ─── */

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
}

function StatCard({ label, value, subtitle, icon, iconBg, loading }: StatCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-[#e5e7eb] p-5 flex items-center gap-4 relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Tonal circle decoration */}
      <div className={`absolute -right-3 -top-3 w-14 h-14 rounded-full opacity-20 ${iconBg}`} />
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${iconBg}`}>
        {icon}
      </div>
      <div className="z-10 min-w-0 flex-1">
        <p className="text-[13px] text-[#6b7280] font-medium truncate">{label}</p>
        <p className="text-[30px] leading-tight font-bold text-[#1a1a1a] tracking-tight">
          {loading ? (
            <Loader2 size={20} className="animate-spin mt-2" style={{ color: '#062F28' }} />
          ) : (
            value
          )}
        </p>
        {/* Admin-exclusive subtitle line */}
        {!loading && subtitle && (
          <p className="text-[11px] text-[#9ca3af] mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function DashboardCards({
  trafficData,
  revenueData,
  occupancyData,
  isLoading,
}: DashboardCardsProps) {
  const loading = isLoading ?? false;

  const formatCompactVND = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B ₫`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₫`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ₫`;
    return value.toLocaleString('vi-VN') + 'đ';
  };

  // ── Card 1: Traffic (lượt ra/vào)
  const totalTraffic = trafficData
    ? (trafficData.summary.totalCheckIn + trafficData.summary.totalCheckOut).toLocaleString('vi-VN')
    : '--';
  const trafficSubtitle = trafficData
    ? `↑ ${trafficData.summary.totalCheckIn.toLocaleString('vi-VN')} vào · ↓ ${trafficData.summary.totalCheckOut.toLocaleString('vi-VN')} ra`
    : undefined;

  // ── Card 2: Revenue (Admin exclusive: avgRevenuePerDay)
  const totalRevenue = revenueData
    ? formatCompactVND(revenueData.summary.grandTotal)
    : '--';
  const revenueSubtitle = revenueData
    ? `TB ${formatCompactVND(revenueData.summary.avgRevenuePerDay)}/ngày · ${revenueData.summary.totalTransactions} GD`
    : undefined;

  // ── Card 3: Effective Occupancy Rate (Admin exclusive field)
  const effectiveOccupancy = occupancyData
    ? `${occupancyData.summary.effectiveOccupancyRate.toFixed(1)}%`
    : '--';
  const occupancySubtitle = occupancyData
    ? `Thực tế · Danh nghĩa: ${occupancyData.summary.overallOccupancyRate.toFixed(1)}%`
    : undefined;

  // ── Card 4: Currently parked (Admin exclusive: currentlyParked from traffic)
  const currentlyParked = occupancyData
    ? occupancyData.summary.totalOccupied.toLocaleString('vi-VN')
    : '--';
  const parkedSubtitle = occupancyData
    ? `${occupancyData.summary.totalAvailable.toLocaleString('vi-VN')} trống · ${occupancyData.summary.totalSlots.toLocaleString('vi-VN')} tổng`
    : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Tổng lượt ra/vào"
        value={totalTraffic}
        subtitle={trafficSubtitle}
        icon={<Car size={22} className="text-[#060606]" />}
        iconBg="bg-[#9FE870]"
        loading={loading}
      />
      <StatCard
        label="Doanh thu hệ thống"
        value={totalRevenue}
        subtitle={revenueSubtitle}
        icon={<TrendingUp size={22} className="text-white" />}
        iconBg="bg-[#22c55e]"
        loading={loading}
      />
      <StatCard
        label="Lấp đầy thực tế"
        value={effectiveOccupancy}
        subtitle={occupancySubtitle}
        icon={<ParkingSquare size={22} className="text-white" />}
        iconBg="bg-[#3b82f6]"
        loading={loading}
      />
      <StatCard
        label="Xe đang đỗ"
        value={currentlyParked}
        subtitle={parkedSubtitle}
        icon={<Receipt size={22} className="text-white" />}
        iconBg="bg-[#f97316]"
        loading={loading}
      />
    </div>
  );
}
