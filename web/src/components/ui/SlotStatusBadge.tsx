import { cn } from '../../lib/utils';
import type { SlotStatus } from '../../services/slot.service';

interface SlotStatusBadgeProps {
  status: SlotStatus;
  className?: string;
  /** Show a short label (default) or full Vietnamese label */
  variant?: 'compact' | 'full';
}

const STATUS_CONFIG: Record<
  SlotStatus,
  { label: string; fullLabel: string; className: string; dot: string }
> = {
  available: {
    label: 'Trống',
    fullLabel: 'Trống (Available)',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  occupied: {
    label: 'Đang dùng',
    fullLabel: 'Đang sử dụng (Occupied)',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  reserved: {
    label: 'Đặt trước',
    fullLabel: 'Đã đặt trước (Reserved)',
    className: 'bg-violet-50 text-violet-700 border border-violet-200',
    dot: 'bg-violet-500',
  },
  maintenance: {
    label: 'Bảo trì',
    fullLabel: 'Đang bảo trì (Maintenance)',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
  },
  locked: {
    label: 'Khóa',
    fullLabel: 'Tạm khóa (Locked)',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
};

/**
 * SlotStatusBadge — color-coded pill indicating a parking slot's current status.
 * Follows the same visual language as the existing Badge component.
 */
export function SlotStatusBadge({ status, className, variant = 'compact' }: SlotStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  const label = variant === 'full' ? cfg.fullLabel : cfg.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {label}
    </span>
  );
}

/** Export the config so SlotGrid can reuse the colour palette */
export { STATUS_CONFIG };
