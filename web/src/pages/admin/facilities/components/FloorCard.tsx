import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertTriangle, Loader2, MoreVertical,
  PowerOff, CheckCircle, Trash2, Pencil, Map, Plus, Layers
} from 'lucide-react';
import { floorService, Floor } from '../../../../services/floor.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ConfirmModal } from '../../../../components/ConfirmModal';

// ── Types ───────────────────────────────────────────────────────────────────

export interface FloorSlotStats {
  total: number;       // totalSlots from Floor model
  occupied: number;    // slots with status 'occupied'
  fillRate: number;    // percentage
}

interface FloorCardProps {
  floor: Floor;
  vehicleTypes: VehicleType[];
  slotStats?: FloorSlotStats;
  onEdit: (floor: Floor) => void;
  onUpdate: (updated: Floor) => void;
  onRemove: (id: string) => void;
  onViewMap: (floor: Floor) => void;
}

interface FloorGridProps {
  isLoading: boolean;
  floors: Floor[];
  vehicleTypes: VehicleType[];
  slotStats: Record<string, FloorSlotStats>;
  onAddFloor: () => void;
  onEditFloor: (floor: Floor) => void;
  onUpdate: (updated: Floor) => void;
  onRemove: (id: string) => void;
  onRefresh: () => void;   // only needed for create/edit
  onViewMap: (floor: Floor) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBarColor(pct: number) {
  if (pct > 85) return '#E24B4A';
  if (pct >= 60) return '#BA7517';
  return '#3B6D11';
}

// ── Skeleton Loader ──

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eae8] p-5 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-16 h-4 bg-gray-100 rounded" />
        <div className="w-12 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="w-24 h-5 bg-gray-100 rounded" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 bg-gray-50 rounded-xl" />
        <div className="h-12 bg-gray-50 rounded-xl" />
        <div className="h-12 bg-gray-50 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <div className="w-16 h-3 bg-gray-100 rounded" />
        <div className="h-1.5 bg-gray-100 rounded-full" />
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-50">
        <div className="w-12 h-6 bg-gray-100 rounded" />
        <div className="w-20 h-6 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Floor Card ──

export const FloorCard = React.memo(function FloorCard({
  floor,
  vehicleTypes,
  slotStats,
  onEdit,
  onUpdate,
  onRemove,
  onViewMap,
}: FloorCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'deactivate' | null>(null);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setLoading(true);
    try {
      if (confirmAction === 'delete') {
        await floorService.softDelete(floor._id);
        toast.success('Xóa tầng thành công');
        onRemove(floor._id);
      } else {
        const res = await floorService.update(floor._id, { status: 'inactive' });
        toast.success(`Đã vô hiệu hóa tầng ${floor.name}`);
        onUpdate(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReactivate = async () => {
    setMenuOpen(false);
    setLoading(true);
    try {
      const res = await floorService.update(floor._id, { status: 'active' });
      toast.success(`Đã kích hoạt tầng ${floor.name}`);
      onUpdate(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Kích hoạt thất bại');
    } finally {
      setLoading(false);
    }
  };

  const total = slotStats?.total ?? floor.totalSlots ?? 0;
  const occupied = slotStats?.occupied ?? 0;
  const fillRate = slotStats?.fillRate ?? 0;
  const barColor = getBarColor(fillRate);
  const fillColor = fillRate > 85 ? '#E24B4A' : fillRate >= 60 ? '#BA7517' : '#3B6D11';

  const isActive = floor.status === 'active';
  const borderColor = isActive ? '#3B6D11' : '#BA7517';

  // Vehicle type name pills - Optimized with useMemo
  const vtNames = useMemo(() => {
    return (floor.allowedVehicleTypes || [])
      .map((item: any) => {
        const typeId = typeof item === 'string' ? item : item._id;
        return vehicleTypes.find((v) => v._id === typeId)?.name || item.name;
      })
      .filter(Boolean);
  }, [floor.allowedVehicleTypes, vehicleTypes]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderLeft: `3px solid ${borderColor}` }}
      className="bg-white rounded-2xl border border-[#e8eae8] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#060606] leading-tight truncate mb-2" title={floor.name}>
            {floor.name}
          </h3>
          <div 
            className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 -mb-1"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <style>{`
              .vehicle-pills::-webkit-scrollbar { display: none; }
            `}</style>
            {vtNames.length === 0 ? (
              <span className="text-xs text-gray-400 italic">Không có loại xe</span>
            ) : vtNames.map(name => (
              <span
                key={name}
                className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: '#EAF3DE', color: '#27500A' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isActive ? (
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: '#EAF3DE', color: '#27500A' }}>
              Hoạt động
            </span>
          ) : (
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-[#BA7517] flex items-center gap-1">
              <AlertTriangle size={10} /> Bảo trì
            </span>
          )}

          {/* Menu dropdown */}
          <div className="relative">
            {loading ? (
              <div className="w-7 h-7 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={15} />
              </button>
            )}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20"
                >
                  <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                  {isActive ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmAction('deactivate');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <PowerOff size={13} /> Vô hiệu hóa
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2"
                      style={{ color: '#27500A' }}
                    >
                      <CheckCircle size={13} /> Kích hoạt lại
                    </button>
                  )}
                  <div className="h-px bg-gray-100 mx-2 my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmAction('delete');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={13} /> Xóa tầng
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-[#f7f8f7] rounded-xl py-2.5">
            <div className="text-sm font-semibold text-[#060606] tabular-nums">{total}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Sức chứa</div>
          </div>
          <div className="bg-[#f7f8f7] rounded-xl py-2.5">
            <div className="text-sm font-semibold text-[#060606] tabular-nums">{occupied}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Đang dùng</div>
          </div>
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400">Công suất</span>
          <span className="tabular-nums" style={{ color: fillColor }}>{fillRate}%</span>
        </div>
        <div className="bg-[#eff0ef] h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${fillRate}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#e8eae8] flex items-center gap-2">
        <button
          onClick={() => onEdit(floor)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border transition-colors hover:bg-[#f0f5e8]"
          style={{ borderColor: '#b8cc30', color: '#3B6D11' }}
        >
          <Pencil size={13} /> Sửa
        </button>
        <button
          onClick={() => onViewMap(floor)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border transition-colors hover:bg-[#f0f5e8]"
          style={{ borderColor: '#b8cc30', color: '#3B6D11' }}
        >
          <Map size={13} /> Sơ đồ slot
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction === 'delete' ? 'Xóa tầng' : 'Vô hiệu hóa tầng'}
        message={
          confirmAction === 'delete'
            ? `Bạn có chắc muốn xóa tầng "${floor.name}"? Thao tác này không thể hoàn tác.`
            : `Bạn có chắc muốn vô hiệu hóa tầng "${floor.name}"? Các slot trong tầng sẽ không khả dụng.`
        }
        confirmText={confirmAction === 'delete' ? 'Xóa' : 'Vô hiệu hóa'}
        variant="danger"
        isLoading={loading}
      />
    </motion.div>
  );
});

// ── Floor Grid ──

export function FloorGrid({
  isLoading,
  floors,
  vehicleTypes,
  slotStats,
  onAddFloor,
  onEditFloor,
  onUpdate,
  onRemove,
  onViewMap,
}: FloorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (floors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8eae8] py-20 flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: '#EAF3DE' }}
        >
          <Layers size={24} style={{ color: '#3B6D11' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#060606]">Không có tầng nào trong cơ sở này</p>
          <p className="text-xs text-gray-400 mt-1">Thêm tầng đầu tiên để bắt đầu quản lý chỗ đỗ xe</p>
        </div>
        <button
          onClick={onAddFloor}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
          style={{ background: '#d7ee46', color: '#1a1a0a' }}
        >
          <Plus size={16} /> Thêm tầng
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {floors.map((floor) => (
        <FloorCard
          key={floor._id}
          floor={floor}
          vehicleTypes={vehicleTypes}
          slotStats={slotStats[floor._id]}
          onEdit={onEditFloor}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onViewMap={onViewMap}
        />
      ))}
    </div>
  );
}
