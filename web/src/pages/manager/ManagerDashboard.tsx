import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ParkingSquare, CheckCircle2, DollarSign, AlertTriangle, ArrowRight, TrendingUp, LogOut } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { reportService, OccupancyReportResponse, RevenueReportResponse } from '../../services/report.service';
import { exceptionService, IException, ExceptionStatus } from '../../services/exception.service';
import { useManagerFacility } from '../../hooks/useManagerFacility';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { CardSkeleton } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExceptionStatusBadge, ExceptionTypeBadge } from '../../components/ui/ExceptionBadge';


function fmtVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getLast7DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
}

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { facilityId, facilityName, redirectToSelection } = useManagerFacility();
  const [occupancy, setOccupancy] = useState<OccupancyReportResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueReportResponse | null>(null);
  const [recentExceptions, setRecentExceptions] = useState<IException[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Guard: nếu chưa chọn cơ sở thì redirect về màn hình chọn
  useEffect(() => {
    if (!facilityId) {
      redirectToSelection();
    }
  }, [facilityId]);

  useEffect(() => {
    if (!facilityId) return;
    const range = getLast7DaysRange();
    Promise.allSettled([
      reportService.getOccupancyReport({ facilityId }),
      reportService.getRevenueReport({ groupBy: 'day', facilityId, ...range }),
      exceptionService.getExceptions({ status: ExceptionStatus.NEW, limit: 5, page: 1, facilityId }),
    ]).then(([occRes, revRes, excRes]) => {
      if (occRes.status === 'fulfilled' && occRes.value.success) setOccupancy(occRes.value.data);
      if (revRes.status === 'fulfilled' && revRes.value.success) setRevenue(revRes.value.data);
      if (excRes.status === 'fulfilled' && excRes.value.success) {
        setRecentExceptions(excRes.value.data.data);
        setPendingCount(excRes.value.data.total);
      }
    }).finally(() => setLoading(false));
  }, [facilityId]);


  const occSummary = occupancy?.summary;
  const revSummary = revenue?.summary;
  const revenueData = revenue?.byTimePeriod ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Xin chào, ${user?.name ?? 'Manager'}`}
        description={`Đang quản lý: ${facilityName || '...'} · ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <button
            onClick={() => {
              sessionStorage.removeItem('manager_facility_id');
              sessionStorage.removeItem('manager_facility_name');
              navigate('/manager/facility-selection', { replace: true });
            }}
            className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#ef4444] border border-[#e8e9e8] px-3 h-[34px] rounded-lg transition-colors"
            title="Đổi cơ sở"
          >
            <LogOut size={13} /> Đổi cơ sở
          </button>
        }
      />


      {/* ── KPI Cards ── */}
      {loading ? (
        <CardSkeleton count={4} className="grid-cols-2 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Slot Đang Có Xe"
            value={(occSummary?.totalOccupied ?? '—').toString()}
            sub={occSummary ? `/ ${occSummary.totalSlots} tổng` : undefined}
            icon={<ParkingSquare size={18} />}
            dark
          />
          <StatCard
            label="Tỷ Lệ Lấp Đầy"
            value={occSummary ? `${occSummary.overallOccupancyRate}%` : '—'}
            sub="toàn bộ bãi"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Doanh Thu 7 Ngày"
            value={revSummary ? fmtVND(revSummary.grandTotal) : '—'}
            sub="VNĐ"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            label="Ngoại Lệ Mới"
            value={pendingCount}
            sub="chờ review"
            icon={<AlertTriangle size={18} />}
          />
        </div>
      )}

      {/* ── Revenue Chart (7 ngày) + Occupancy by floor ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue trend */}
        <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#060606]">Doanh Thu 7 Ngày Qua</h3>
            <Link to="/manager/reports/revenue" className="text-[12px] font-medium text-[#a0a0a0] hover:text-[#060606] flex items-center gap-1">
              Chi tiết <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="h-[180px] bg-[#f9f9f9] rounded-lg animate-pulse" />
          ) : !revenueData || revenueData.length === 0 ? (
            <EmptyState description="Chưa có dữ liệu doanh thu" className="h-[180px]" />
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ left: -15, right: 0, top: 4 }}>
                  <defs>
                    <linearGradient id="revGradDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d7ee46" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d7ee46" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 10 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 10 }} tickFormatter={fmtVND} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                  />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#a3b822" strokeWidth={2} fill="url(#revGradDash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Floor occupancy bars */}
        <div className="bg-white rounded-xl border border-[#e8e9e8] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#060606]">Lấp Đầy Theo Tầng</h3>
            <Link to="/manager/reports/traffic" className="text-[12px] font-medium text-[#a0a0a0] hover:text-[#060606] flex items-center gap-1">
              Chi tiết <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="h-[180px] bg-[#f9f9f9] rounded-lg animate-pulse" />
          ) : !occupancy || !occupancy.floors || occupancy.floors.length === 0 ? (
            <EmptyState description="Chưa có dữ liệu slot" className="h-[180px]" />

          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy.floors.slice(0, 8)} layout="vertical" margin={{ left: 40, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false}
                    tick={{ fill: '#a0a0a0', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="floorName" axisLine={false} tickLine={false}
                    tick={{ fill: '#6b6b6b', fontSize: 10 }} width={36} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(v: any) => [`${v}%`, 'Lấp đầy']}
                  />
                  <Bar dataKey="occupancyRate" fill="#d7ee46" radius={[0, 3, 3, 0]} maxBarSize={14} name="Lấp đầy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Exception Queue ── */}
      <div className="bg-white rounded-xl border border-[#e8e9e8]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f1f0]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#ef4444]" />
            <h3 className="font-bold text-[#060606]">Ngoại Lệ Chờ Review</h3>
            {pendingCount > 0 && (
              <span className="bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {pendingCount}
              </span>
            )}
          </div>
          <Link to="/manager/exceptions" className="text-[12px] font-medium text-[#a0a0a0] hover:text-[#060606] flex items-center gap-1">
            Xem tất cả <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[#f9f9f9] rounded-lg animate-pulse" />)}
          </div>
        ) : !recentExceptions || recentExceptions.length === 0 ? (
          <EmptyState
            title="Không có ngoại lệ mới"
            description="Tất cả trường hợp bất thường đã được xử lý"
            icon={<CheckCircle2 size={28} className="text-[#22c55e]" />}
            className="py-8"
          />
        ) : (
          <div className="divide-y divide-[#f0f1f0]">
            {recentExceptions.map((ex) => {
              const session = typeof ex.sessionId === 'object' ? ex.sessionId : null;
              return (
                <div key={ex._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                  <ExceptionTypeBadge type={ex.type} short />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#060606] truncate">{ex.description}</p>
                    <p className="text-[11px] text-[#a0a0a0]">
                      {session ? `Biển: ${session.licensePlate}` : ''} · {new Date(ex.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ExceptionStatusBadge status={ex.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
