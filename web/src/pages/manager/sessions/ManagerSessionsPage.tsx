import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Car, Clock, AlertTriangle } from 'lucide-react';

import { toast } from 'sonner';
import { sessionService, ParkingSession, SessionStatus, SessionsParams } from '../../../services/session.service';

import { StatCard } from '../../../components/ui/StatCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FacilitySelector } from '../components/FacilitySelector';
import { SessionTable } from './components/SessionTable';

export default function ManagerSessionsPage() {
  const [facilityId, setFacilityId] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!facilityId) return;
    setLoading(true);
    try {
      const params: SessionsParams = { facilityId, limit: 100 };
      const res = await sessionService.getActiveSessions(params);
      if (res.success) setSessions(res.data);
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách lượt gửi xe');
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // ── Client-side filter ──
  const filtered = sessions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.licensePlate.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Summary ──
  const stats = {
    active:   sessions.filter(s => s.status === SessionStatus.ACTIVE).length,
    pending:  sessions.filter(s => s.status === SessionStatus.PENDING_PAYMENT).length,
    exception: sessions.filter(s => s.status === SessionStatus.EXCEPTION).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lượt Gửi Xe"
        description="Theo dõi các lượt gửi xe đang hoạt động trong bãi"
        actions={
          <button
            onClick={loadSessions}
            disabled={!facilityId || loading}
            className="flex items-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] font-semibold text-[13px] px-4 h-[38px] rounded-lg hover:bg-[#f5f5f4] transition-colors disabled:opacity-40"
          >
            {loading ? 'Đang tải...' : '↻ Làm mới'}
          </button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Đang Trong Bãi" value={stats.active} icon={<Car size={18} />} />
        <StatCard label="Chờ Thanh Toán" value={stats.pending} icon={<Clock size={18} />} />
        <StatCard label="Có Ngoại Lệ" value={stats.exception} icon={<AlertTriangle size={18} />} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <FacilitySelector
          value={facilityId}
          onChange={setFacilityId}
          placeholder="Chọn bãi xe để xem lượt gửi"
          className="w-56"
        />

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="appearance-none pl-3 pr-8 h-[38px] border border-[#e8e9e8] rounded-lg bg-white text-[13px] text-[#060606] font-medium outline-none cursor-pointer focus:border-[#d7ee46]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value={SessionStatus.ACTIVE}>Đang gửi</option>
            <option value={SessionStatus.PENDING_PAYMENT}>Chờ thanh toán</option>
            <option value={SessionStatus.EXCEPTION}>Ngoại lệ</option>
            <option value={SessionStatus.COMPLETED}>Hoàn thành</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm biển số hoặc mã lượt..."
            className="w-full pl-9 pr-4 h-[38px] bg-white border border-[#e8e9e8] rounded-lg text-[13px] outline-none focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all"
          />
        </div>
      </div>

      {/* ── Notice if no facility selected ── */}
      {!facilityId && !loading && (
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#1e40af]">
            Vui lòng chọn bãi xe để xem danh sách lượt gửi.
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {(facilityId || loading) && (
        <SessionTable data={filtered} loading={loading} />
      )}

      {/* Summary */}
      {filtered.length > 0 && (
        <p className="text-[12px] text-[#a0a0a0] text-right">
          Hiển thị {filtered.length} / {sessions.length} lượt gửi
        </p>
      )}
    </div>
  );
}
