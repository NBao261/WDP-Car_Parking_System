import { useState, useEffect, useCallback } from 'react';
import { Download, DollarSign, TrendingUp, CreditCard, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  reportService,
  RevenueReportResponse,
  ReportGroupBy,
} from '../../../services/report.service';
import { StatCard } from '../../../components/ui/StatCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ReportFilterBar } from './components/ReportFilterBar';
import { DateRange } from '../components/DateRangePicker';

const PIE_COLORS = ['#1a1a1a', '#d7ee46', '#a3b822', '#e8e9e8', '#6b6b6b'];
const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Tiền mặt', qr_pay: 'QR Pay', e_wallet: 'Ví điện tử', bank_card: 'Thẻ NH',
};

function fmtVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getDefaultRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function ManagerRevenueReportsPage() {
  const [facilityId, setFacilityId] = useState('');
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('day');
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [report, setReport] = useState<RevenueReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getRevenueReport({
        facilityId: facilityId || undefined,
        groupBy,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      if (res.success) setReport(res.data);
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  }, [facilityId, groupBy, dateRange]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const summary = report?.summary;
  const timeData = report?.byTimePeriod ?? [];
  const methodData = (report?.byMethod ?? []).map((m) => ({
    ...m,
    label: PAYMENT_LABELS[m.method] ?? m.method,
  }));
  const vehicleData = report?.byVehicleType ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Doanh Thu"
        description="Phân tích doanh thu theo thời gian, phương thức thanh toán và loại xe"
        actions={
          <button className="flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] font-semibold text-[13px] px-4 h-[38px] rounded-lg hover:bg-[#f5f5f4] transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
        }
      />

      {/* Filters */}
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
      ) : !report ? (
        <EmptyState description="Không thể tải dữ liệu. Vui lòng thử lại." />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Tổng Doanh Thu"
              value={fmtVND(summary?.grandTotal ?? 0)}
              sub="VNĐ"
              icon={<DollarSign size={18} />}
              dark
            />
            <StatCard
              label="Số Giao Dịch"
              value={(summary?.totalTransactions ?? 0).toLocaleString()}
              icon={<CreditCard size={18} />}
            />
            <StatCard
              label="Trung Bình / Ngày"
              value={fmtVND(summary?.avgRevenuePerDay ?? 0)}
              sub="VNĐ"
              icon={<TrendingUp size={18} />}
            />
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
            <h3 className="font-bold text-[#060606] mb-5">Xu Hướng Doanh Thu</h3>
            {timeData.length === 0 ? (
              <EmptyState description="Chưa có dữ liệu trong khoảng thời gian đã chọn" />
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData} margin={{ left: -10, right: 0, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevMgr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d7ee46" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d7ee46" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} tickFormatter={fmtVND} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                    />
                    <Area type="monotone" dataKey="totalRevenue" stroke="#a3b822" strokeWidth={2} fill="url(#colorRevMgr)" name="Doanh thu" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Method + Vehicle Type */}
          <div className="grid grid-cols-2 gap-4">
            {/* By payment method */}
            <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
              <h3 className="font-bold text-[#060606] mb-5 flex items-center gap-2">
                <CreditCard size={16} /> Theo Phương Thức Thanh Toán
              </h3>
              {methodData.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodData} margin={{ left: -15, right: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 11 }} tickFormatter={fmtVND} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                        formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                      />
                      <Bar dataKey="totalRevenue" fill="#1a1a1a" radius={[4, 4, 0, 0]} maxBarSize={48} name="Doanh thu" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* By vehicle type */}
            <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
              <h3 className="font-bold text-[#060606] mb-5 flex items-center gap-2">
                <BarChart2 size={16} /> Theo Loại Xe
              </h3>
              {vehicleData.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="totalRevenue"
                        nameKey="vehicleTypeName"
                        paddingAngle={3}
                      >
                        {vehicleData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                        formatter={(v: any, name: any) => [`${Number(v).toLocaleString('vi-VN')}đ`, name]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: 11, color: '#6b6b6b' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Transaction detail table */}
          {timeData.length > 0 && (
            <div className="bg-white rounded-xl border border-[#e8e9e8] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f1f0]">
                <h3 className="font-bold text-[#060606]">Chi Tiết Theo Thời Gian</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f4] text-[#6b6b6b] text-[11px] uppercase font-semibold tracking-[0.5px]">
                      <th className="px-5 py-3">Ngày / Tuần / Tháng</th>
                      <th className="px-5 py-3 text-right">Doanh Thu</th>
                      <th className="px-5 py-3 text-right">Số GD</th>
                      <th className="px-5 py-3 text-right">TB/GD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f1f0]">
                    {timeData.map((row, i) => (
                      <tr key={i} className="hover:bg-[#fafafa] h-[44px]">
                        <td className="px-5 text-[13px] font-mono text-[#6b6b6b]">{row.label}</td>
                        <td className="px-5 text-[13px] font-bold text-right">{row.totalRevenue.toLocaleString('vi-VN')}đ</td>
                        <td className="px-5 text-[13px] text-right text-[#6b6b6b]">{row.transactionCount}</td>
                        <td className="px-5 text-[13px] text-right text-[#6b6b6b]">{row.avgRevenue.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
