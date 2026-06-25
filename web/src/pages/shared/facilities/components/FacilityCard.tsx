import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Clock,
  Layers,
  MoreVertical,
  Edit,
  PowerOff,
  CheckCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Facility, facilityService } from '../../../../services/facility.service';
import { ConfirmModal } from '../../../../components/ConfirmModal';

interface FacilityStats {
  totalSlots: number;
  occupied: number;
  reserved?: number;
  fillRate: number;
}

interface FacilityCardProps {
  facility: Facility;
  stats?: FacilityStats;
  onEdit: (f: Facility) => void;
  onViewFloors: (f: Facility) => void;
  onUpdate: (updated: Facility) => void;
  onRemove: (id: string) => void;
  onViewDetail?: (f: Facility) => void;
}

function getBarColor(pct: number) {
  if (pct > 85) return '#E24B4A';
  if (pct >= 60) return '#BA7517';
  return '#3B6D11';
}

function getBarTextColor(pct: number) {
  if (pct > 85) return 'text-[#E24B4A]';
  if (pct >= 60) return 'text-[#BA7517]';
  return 'text-[#3B6D11]';
}

export function FacilityCard({
  facility,
  stats,
  onEdit,
  onViewFloors,
  onUpdate,
  onRemove,
  onViewDetail,
}: FacilityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'delete'>('deactivate');
  const [hovered, setHovered] = useState(false);

  const isActive = facility.status === 'active';
  const totalSlots = stats?.totalSlots ?? 0;
  const inUse = stats?.occupied ?? 0;
  const fillRate = stats?.fillRate ?? 0;
  const barColor = getBarColor(fillRate);
  const textColor = getBarTextColor(fillRate);

  const badgeStyle = isActive
    ? { background: '#ECFDF5', color: '#047857', border: '1px solid #D1FAE5', fontWeight: 'bold' }
    : { background: '#f0f1f0', color: '#6b6e6b', border: '1px solid #e2e3e2', fontWeight: 'bold' };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const occupied = stats?.occupied ?? 0;
      const reserved = stats?.reserved ?? 0;

      if (occupied > 0 || reserved > 0) {
        toast.error(
          confirmAction === 'delete'
            ? 'Không thể xóa cơ sở vì đang có slot đang dùng hoặc đã đặt trước.'
            : 'Không thể thay đổi trạng thái vì đang có slot đang dùng hoặc đã đặt trước.'
        );
        setConfirmOpen(false);
        setLoading(false);
        return;
      }

      if (confirmAction === 'deactivate') {
        const res = await facilityService.deactivate(facility._id);
        toast.success(`Đã vô hiệu hóa "${facility.name}"`);
        onUpdate(res.data);
      } else {
        await facilityService.deleteFacility(facility._id);
        toast.success(`Đã xóa cơ sở "${facility.name}"`);
        onRemove(facility._id);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('active parking sessions')) {
        toast.error(
          confirmAction === 'delete'
            ? 'Không thể xóa cơ sở vì đang có slot đang dùng hoặc đã đặt trước.'
            : 'Không thể thay đổi trạng thái vì đang có slot đang dùng hoặc đã đặt trước.'
        );
      } else {
        toast.error(msg || 'Thao tác thất bại');
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleDeactivate = () => {
    setMenuOpen(false);
    setConfirmAction('deactivate');
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const handleReactivate = async () => {
    setMenuOpen(false);
    setLoading(true);
    try {
      const res = await facilityService.update(facility._id, { status: 'active' });
      toast.success(`Đã kích hoạt lại "${facility.name}"`);
      onUpdate(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        border: hovered ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      className={!isActive ? 'opacity-70' : ''}
      onClick={() => onViewDetail?.(facility)}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 relative">
        <div className="flex gap-3 min-w-0">
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(204,226,66,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 size={24} style={{ color: '#4a7c20' }} />
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3
                className="text-[15px] text-[#060606] font-semibold truncate"
                title={facility.name}
              >
                {facility.name}
              </h3>
            </div>
            <div
              className="text-[13px] flex items-center gap-1.5 mt-1 min-w-0"
              style={{ color: '#6b6e6b' }}
            >
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate" title={facility.address}>
                {facility.address}
              </span>
            </div>
          </div>
        </div>

        {/* Badge & Action Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            style={{
              fontSize: 10,
              padding: '3px 10px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              ...badgeStyle,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isActive ? '#10b981' : '#9b9e9b',
              }}
            />
            {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ VÔ HIỆU HÓA'}
          </span>
          <div className="relative -mr-2" onClick={(e) => e.stopPropagation()}>
            {loading ? (
              <div className="w-7 h-7 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
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
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(facility);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Chỉnh sửa
                  </button>
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  {isActive ? (
                    <button
                      onClick={handleDeactivate}
                      className="w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <PowerOff size={14} /> Vô hiệu hóa
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2"
                      style={{ color: '#27500A' }}
                    >
                      <CheckCircle size={14} /> Kích hoạt lại
                    </button>
                  )}
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Xóa cơ sở
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-5 pb-3 flex items-center gap-4 text-[13px]" style={{ color: '#9b9e9b' }}>
        <span className="flex items-center gap-1">
          <Layers size={12} /> {facility.totalFloors} tầng
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {facility.openTime} – {facility.closeTime}
        </span>
      </div>

      {/* Stats grid */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '8px 4px' }}
          >
            <div className="text-[17px] tabular-nums font-semibold" style={{ color: '#060606' }}>
              {totalSlots}
            </div>
            <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Tổng slot</div>
          </div>
          <div
            style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '8px 4px' }}
          >
            <div className="text-[17px] tabular-nums font-semibold" style={{ color: '#060606' }}>
              {inUse}
            </div>
            <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Đang dùng</div>
          </div>
          <div
            style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '8px 4px' }}
          >
            <div className={`text-[17px] tabular-nums font-semibold ${textColor}`}>{fillRate}%</div>
            <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Lấp đầy</div>
          </div>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="px-5 pb-4">
        <div
          className="flex items-center justify-between mb-1.5"
          style={{ fontSize: 12, color: '#9b9e9b' }}
        >
          <span>Tỷ lệ lấp đầy</span>
          <span style={{ color: '#6b6e6b' }}>
            {new Date(facility.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
        <div style={{ background: '#eff0ef', height: 6, borderRadius: 999, overflow: 'hidden' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${fillRate}%`, background: barColor }}
          />
        </div>
      </div>

      {/* View Floors button */}
      <div className="px-5 py-3 mt-auto" style={{ borderTop: '1px solid #f0f1f0' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!confirmOpen) onViewFloors(facility);
          }}
          style={{
            width: '100%',
            padding: '10px 20px',
            borderRadius: 10,
            border: hovered ? '1.5px solid #cce242' : '1.5px solid #c8d4b8',
            background: hovered ? '#cce242' : 'white',
            color: '#060606',
            fontWeight: hovered ? 600 : 500,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <Building2 size={13} style={{ color: '#4a7c20' }} /> Xem các tầng →
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ConfirmModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          title={
            confirmAction === 'delete' ? 'Xóa tòa nhà / bãi đỗ' : 'Vô hiệu hóa tòa nhà / bãi đỗ'
          }
          message={
            confirmAction === 'delete'
              ? `Bạn có chắc muốn xóa tòa nhà / bãi đỗ "${facility.name}"? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.`
              : `Bạn có chắc muốn vô hiệu hóa tòa nhà / bãi đỗ "${facility.name}"? Các tầng sẽ được chuyển thành trạng thái vô hiệu hóa.`
          }
          confirmText={confirmAction === 'delete' ? 'Xóa vĩnh viễn' : 'Vô hiệu hóa'}
          variant={confirmAction === 'delete' ? 'danger' : 'warning'}
          isLoading={loading}
        />
      </div>
    </motion.div>
  );
}

// ─── FacilityListItem (list view mode) ────────────────────────────────────────
export function FacilityListItem({
  facility,
  stats,
  onViewFloors,
  onViewDetail,
}: Omit<FacilityCardProps, 'onEdit' | 'onRemove' | 'onUpdate'>) {
  const [hovered, setHovered] = useState(false);
  const isActive = facility.status === 'active';
  const totalSlots = stats?.totalSlots ?? 0;
  const fillRate = stats?.fillRate ?? 0;
  const barColor = getBarColor(fillRate);

  const accentColor = isActive ? '#cce242' : '#e2e3e2';
  const badgeStyle = isActive
    ? { background: '#ECFDF5', color: '#047857', border: '1px solid #D1FAE5', fontWeight: 'bold' }
    : { background: '#f0f1f0', color: '#6b6e6b', border: '1px solid #e2e3e2', fontWeight: 'bold' };

  return (
    <div
      className={`bg-white flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer ${!isActive ? 'opacity-70' : ''}`}
      style={{
        border: hovered ? '1.5px solid #cce242' : '1.5px solid #e2e3e2',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onViewDetail?.(facility)}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(204,226,66,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Building2 size={20} style={{ color: '#4a7c20' }} />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[15px] text-[#060606] font-semibold">{facility.name}</span>
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              ...badgeStyle,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isActive ? '#10b981' : '#9b9e9b',
              }}
            />
            {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ VÔ HIỆU HÓA'}
          </span>
        </div>
        <span
          className="text-[13px] block truncate"
          title={facility.address}
          style={{ color: '#9b9e9b' }}
        >
          {facility.address}
        </span>
      </div>
      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0 hidden md:flex">
        <div className="text-center">
          <div className="text-[15px] text-[#060606] tabular-nums font-medium">
            {facility.totalFloors}
          </div>
          <div style={{ fontSize: 11, color: '#9b9e9b' }}>Tầng</div>
        </div>
        <div className="text-center">
          <div className="text-[15px] text-[#060606] tabular-nums font-medium">{totalSlots}</div>
          <div style={{ fontSize: 11, color: '#9b9e9b' }}>Tổng slot</div>
        </div>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 80,
              background: '#eff0ef',
              height: 6,
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${fillRate}%`,
                height: '100%',
                background: barColor,
                borderRadius: 999,
              }}
            />
          </div>
          <span className="text-[15px] tabular-nums font-semibold" style={{ color: barColor }}>
            {fillRate}%
          </span>
        </div>
      </div>
      {/* Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewFloors(facility);
        }}
        style={{
          padding: '7px 16px',
          borderRadius: 10,
          border: '1.5px solid #c8d4b8',
          background: 'white',
          color: '#060606',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#cce242';
          e.currentTarget.style.borderColor = '#cce242';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#c8d4b8';
        }}
      >
        Xem tầng →
      </button>
    </div>
  );
}
