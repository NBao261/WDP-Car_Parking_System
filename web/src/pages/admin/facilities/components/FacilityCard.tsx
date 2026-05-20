import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2, MapPin, Clock, Layers, MoreVertical,
  Edit, PowerOff, CheckCircle, Loader2,
} from 'lucide-react';
import { Facility, facilityService } from '../../../../services/facility.service';

interface FacilityStats {
  totalSlots: number;
  occupied: number;
  fillRate: number;
}

interface FacilityCardProps {
  facility: Facility;
  stats?: FacilityStats;           // real aggregated slot data from parent
  onEdit: (f: Facility) => void;
  onViewFloors: (f: Facility) => void;
  onRefresh: () => void;
}

function getBarColor(pct: number) {
  if (pct > 85) return '#E24B4A';
  if (pct >= 60) return '#BA7517';
  return '#3B6D11';
}

export function FacilityCard({ facility, stats, onEdit, onViewFloors, onRefresh }: FacilityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isActive = facility.status === 'active';

  // Use real stats from parent (computed from actual slot data)
  const totalSlots = stats?.totalSlots ?? 0;
  const inUse      = stats?.occupied   ?? 0;
  const fillRate   = stats?.fillRate   ?? 0;
  const barColor      = getBarColor(fillRate);
  const fillTextColor = fillRate > 85 ? '#E24B4A' : fillRate >= 60 ? '#BA7517' : '#3B6D11';

  const handleDeactivate = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Vô hiệu hóa cơ sở "${facility.name}"?\nCác slot trống sẽ được đặt thành bảo trì.`)) return;
    setLoading(true);
    try {
      await facilityService.deactivate(facility._id);
      toast.success(`Đã vô hiệu hóa "${facility.name}"`);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  const handleReactivate = async () => {
    setMenuOpen(false);
    setLoading(true);
    try {
      await facilityService.update(facility._id, { status: 'active' });
      toast.success(`Đã kích hoạt lại "${facility.name}"`);
      onRefresh();
    } catch (err: any) { toast.error(err.message || 'Thao tác thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={() => onViewFloors(facility)}
      style={{ borderTop: `3px solid ${isActive ? '#3B6D11' : '#9ca3af'}` }}
      className={`cursor-pointer bg-white rounded-2xl border border-[#e8eae8] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${!isActive ? 'opacity-60' : ''}`}
    >
      {/* ── Header: name+address LEFT | icon RIGHT ── */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name row + status badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-[#060606]">{facility.name}</h3>
            {isActive ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: '#EAF3DE', color: '#27500A' }}>
                Hoạt động
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-400">
                Đã tắt
              </span>
            )}
          </div>
          {/* Address */}
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={10} /> {facility.address}
          </p>
        </div>

        {/* Icon (right) + menu */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isActive ? '#EAF3DE' : '#f3f4f6' }}>
            <Building2 size={16} style={{ color: isActive ? '#3B6D11' : '#9ca3af' }} />
          </div>

          {/* ⋮ menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {loading ? (
              <div className="w-7 h-7 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={16} />
              </button>
            )}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20"
                >
                  <div className="fixed inset-0 z-[-1]"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(facility); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Chỉnh sửa
                  </button>
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  {isActive ? (
                    <button onClick={handleDeactivate}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <PowerOff size={14} /> Vô hiệu hóa
                    </button>
                  ) : (
                    <button onClick={handleReactivate}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
                      style={{ color: '#27500A' }}>
                      <CheckCircle size={14} /> Kích hoạt lại
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Meta row: floors count + operating hours ── */}
      <div className="px-5 pb-3 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Layers size={11} /> {facility.totalFloors ?? 0} tầng
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {facility.openTime} – {facility.closeTime}
        </span>
      </div>

      {/* ── Stats grid: Total slots / In use / Fill rate ── */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#f7f8f7] rounded-xl py-2.5">
            <div className="text-sm font-semibold text-[#060606] tabular-nums">{totalSlots}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Tổng slot</div>
          </div>
          <div className="bg-[#f7f8f7] rounded-xl py-2.5">
            <div className="text-sm font-semibold text-[#060606] tabular-nums">{inUse}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Đang dùng</div>
          </div>
          <div className="bg-[#f7f8f7] rounded-xl py-2.5">
            <div className="text-sm font-semibold tabular-nums" style={{ color: fillTextColor }}>{fillRate}%</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Lấp đầy</div>
          </div>
        </div>
      </div>

      {/* ── Occupancy bar ── */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400">Công suất</span>
          <span className="text-gray-400">
            {new Date(facility.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
        <div className="bg-[#eff0ef] h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(fillRate, 100)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 mt-auto border-t border-[#e8eae8] flex justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); onViewFloors(facility); }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[#f0f5e8]"
          style={{ borderColor: '#b8cc30', color: '#3B6D11' }}
        >
          Xem các tầng →
        </button>
      </div>
    </motion.div>
  );
}
