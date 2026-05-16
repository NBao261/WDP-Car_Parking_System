import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Wrench, Car, BookMarked, CircleDot } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ParkingSlot, SlotStatus } from '../../services/slot.service';
import { STATUS_CONFIG } from './SlotStatusBadge';

interface SlotCellProps {
  slot: ParkingSlot;
  vehicleTypeName?: string;
  onStatusChange?: (slot: ParkingSlot) => void;
  readOnly?: boolean;
}

/** Icon per status for the cell overlay */
const STATUS_ICON: Record<SlotStatus, React.ReactNode> = {
  available: <CircleDot size={14} />,
  occupied: <Car size={14} />,
  reserved: <BookMarked size={14} />,
  maintenance: <Wrench size={14} />,
  locked: <Lock size={14} />,
};

/** Background + border colour for each cell */
const CELL_BG: Record<SlotStatus, string> = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  occupied: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
  reserved: 'bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200',
  maintenance: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200',
  locked: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200',
};

function SlotCell({ slot, onStatusChange, readOnly }: SlotCellProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[slot.status] ?? STATUS_CONFIG.available;
  const bg = CELL_BG[slot.status] ?? CELL_BG.available;

  return (
    <motion.div
      whileHover={{ scale: readOnly ? 1 : 1.05 }}
      whileTap={{ scale: readOnly ? 1 : 0.97 }}
      className={cn(
        'relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-colors',
        bg,
        readOnly && 'cursor-default',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !readOnly && onStatusChange?.(slot)}
      title={`${slot.code} — ${cfg.fullLabel}`}
    >
      <span className="text-xs font-semibold leading-none">{slot.code}</span>

      {/* Tooltip on hover */}
      {hovered && !readOnly && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: -2 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap pointer-events-none shadow-lg"
        >
          Click để đổi trạng thái
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Legend ────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.entries(STATUS_CONFIG) as [SlotStatus, (typeof STATUS_CONFIG)[SlotStatus]][]).map(
        ([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={cn('w-3 h-3 rounded border', CELL_BG[status].split(' ')[0], CELL_BG[status].split(' ')[1])} />
            {cfg.label}
          </div>
        ),
      )}
    </div>
  );
}

// ── SlotGrid ──────────────────────────────────────────────
export interface SlotGridProps {
  slots: ParkingSlot[];
  vehicleTypeMap?: Record<string, string>; // id → name
  onSlotClick?: (slot: ParkingSlot) => void;
  readOnly?: boolean;
  /** How many columns in the grid (default: auto based on slot count) */
  columns?: number;
  isLoading?: boolean;
}

/**
 * SlotGrid — renders an interactive floor-map of parking slots.
 * Each cell is colour-coded by status and clickable (unless readOnly).
 */
export function SlotGrid({
  slots,
  vehicleTypeMap = {},
  onSlotClick,
  readOnly = false,
  columns,
  isLoading = false,
}: SlotGridProps) {
  const cols = columns ?? 10;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: Math.max(slots.length, 20) }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <Car size={36} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Tầng này chưa có slot nào.</p>
      </div>
    );
  }

  // Stats bar
  const counts = slots.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SlotStatus, number>,
  );

  const sortedSlots = [...slots].sort((a, b) => 
    a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_CONFIG) as SlotStatus[]).map((status) =>
          (counts[status] ?? 0) > 0 ? (
            <span
              key={status}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                CELL_BG[status],
              )}
            >
              <span
                className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[status].dot)}
              />
              {STATUS_CONFIG[status].label}: {counts[status]}
            </span>
          ) : null,
        )}
        <span className="ml-auto text-xs text-gray-400 self-center">
          Tổng: {slots.length} slot
        </span>
      </div>

      {/* Legend */}
      <Legend />

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {sortedSlots.map((slot) => (
          <SlotCell
            key={slot._id}
            slot={slot}
            vehicleTypeName={
              typeof slot.vehicleTypeId === 'object'
                ? slot.vehicleTypeId.name
                : vehicleTypeMap[slot.vehicleTypeId]
            }
            onStatusChange={onSlotClick}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
