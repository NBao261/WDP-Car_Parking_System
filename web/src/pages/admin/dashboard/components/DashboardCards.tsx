import { TrendingUp, CarFront, GaugeCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { TrafficReportData, RevenueReportData, OccupancyReportData } from '../../../../services/report.service';

interface DashboardCardsProps {
  trafficData: TrafficReportData | null;
  revenueData: RevenueReportData | null;
  occupancyData: OccupancyReportData | null;
  isLoading?: boolean;
}

export function DashboardCards({
  trafficData,
  revenueData,
  occupancyData,
  isLoading,
}: DashboardCardsProps) {
  const loading = isLoading ?? false;

  const formatCompactVND = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString('vi-VN');
  };

  // ── Data Computations ──
  const totalRevenue = revenueData?.summary.grandTotal ?? 0;
  const avgRevenue = revenueData?.summary.avgRevenuePerDay ?? 0;
  const totalTransactions = revenueData?.summary.totalTransactions ?? 0;

  const totalSlots = occupancyData?.summary.totalSlots ?? 0;
  const totalOccupied = occupancyData?.summary.totalOccupied ?? 0;
  const occupancyRate = occupancyData?.summary.effectiveOccupancyRate ?? 0;

  const checkIn = trafficData?.summary.totalCheckIn ?? 0;
  const checkOut = trafficData?.summary.totalCheckOut ?? 0;
  const totalTraffic = checkIn + checkOut;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-8 flex items-center justify-center min-h-[160px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-[#062F28]" />
          <p className="text-[13px] text-[#6b7280] font-medium">Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm flex flex-col lg:flex-row overflow-hidden">
      
      {/* ─── Column 1: Revenue (Business Core) ─── */}
      <div className="flex-1 p-6 flex flex-col justify-between relative group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-[#6b7280] tracking-wider uppercase flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[#062F28]" /> Doanh thu hệ thống
          </h3>
        </div>
        
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-bold text-[#062F28] tracking-tight tabular-nums leading-none">
              {formatCompactVND(totalRevenue)}
            </span>
            <span className="text-[16px] font-semibold text-[#6b7280]">VNĐ</span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium mb-0.5">TB mỗi ngày</p>
              <p className="text-[14px] font-semibold text-[#1a1a1a] tabular-nums">{formatCompactVND(avgRevenue)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium mb-0.5">Lượt giao dịch</p>
              <p className="text-[14px] font-semibold text-[#1a1a1a] tabular-nums">{totalTransactions.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-[1px] bg-[#e5e7eb] my-4" />
      <div className="block lg:hidden h-[1px] bg-[#e5e7eb] mx-4" />

      {/* ─── Column 2: Traffic & Capacity (Operation) ─── */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-[#6b7280] tracking-wider uppercase flex items-center gap-1.5">
            <CarFront size={14} className="text-[#062F28]" /> Lưu lượng & Sức chứa
          </h3>
        </div>

        <div>
          {/* Capacity Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[13px] font-semibold text-[#1a1a1a]">
                <span className="text-[#062F28] text-[20px] tabular-nums">{totalOccupied.toLocaleString('vi-VN')}</span>
                <span className="text-[#9ca3af] text-[13px] font-normal mx-1">/</span>
                <span className="text-[#6b7280] text-[15px] tabular-nums">{totalSlots.toLocaleString('vi-VN')} xe</span>
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[#062F28] rounded-l-full transition-all duration-1000 ease-out"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium">Tổng ra/vào</p>
              <p className="text-[13px] font-bold text-[#1a1a1a] tabular-nums">{totalTraffic.toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium">Xe vào</p>
              <p className="text-[13px] font-bold text-[#16a34a] tabular-nums">+{checkIn.toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af] font-medium">Xe ra</p>
              <p className="text-[13px] font-bold text-[#ea580c] tabular-nums">-{checkOut.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-[1px] bg-[#e5e7eb] my-4" />
      <div className="block lg:hidden h-[1px] bg-[#e5e7eb] mx-4" />

      {/* ─── Column 3: Efficiency & Status ─── */}
      <div className="w-full lg:w-[30%] p-6 flex flex-col justify-between bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-bold text-[#6b7280] tracking-wider uppercase flex items-center gap-1.5">
            <GaugeCircle size={14} className="text-[#062F28]" /> Hiệu suất lấp đầy
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-1">
            <span className="text-[36px] font-bold text-[#1a1a1a] tracking-tight tabular-nums leading-none">
              {occupancyRate.toFixed(1)}
            </span>
            <span className="text-[20px] font-semibold text-[#6b7280]">%</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
            <ShieldCheck size={16} className="text-[#16a34a]" />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#1a1a1a]">Trạng thái ổn định</span>
              <span className="text-[10px] text-[#6b7280]">Hệ thống hoạt động bình thường</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

