import { ExceptionStatus, ExceptionType, EXCEPTION_STATUS_LABELS, EXCEPTION_TYPE_LABELS } from '../../services/exception.service';
import { cn } from '../../lib/utils';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ExceptionStatus, string> = {
  [ExceptionStatus.NEW]:        'bg-[#fef9c3] text-[#854d0e] border-[#fde047]/40',
  [ExceptionStatus.PROCESSING]: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]/40',
  [ExceptionStatus.RESOLVED]:   'bg-[#dcfce7] text-[#166534] border-[#86efac]/40',
  [ExceptionStatus.REJECTED]:   'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]/40',
};

const STATUS_DOTS: Record<ExceptionStatus, string> = {
  [ExceptionStatus.NEW]:        'bg-[#eab308]',
  [ExceptionStatus.PROCESSING]: 'bg-[#3b82f6]',
  [ExceptionStatus.RESOLVED]:   'bg-[#22c55e]',
  [ExceptionStatus.REJECTED]:   'bg-[#ef4444]',
};

interface ExceptionStatusBadgeProps {
  status: ExceptionStatus;
  showDot?: boolean;
  className?: string;
}

/**
 * ExceptionStatusBadge — Badge trạng thái ngoại lệ (new/processing/resolved/rejected).
 */
export function ExceptionStatusBadge({ status, showDot = true, className }: ExceptionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
        STATUS_STYLES[status],
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOTS[status])} />}
      {EXCEPTION_STATUS_LABELS[status]}
    </span>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ExceptionType, string> = {
  [ExceptionType.LOST_CARD]:    'bg-[#f0fdf4] text-[#166534]',
  [ExceptionType.WRONG_PLATE]:  'bg-[#fff7ed] text-[#c2410c]',
  [ExceptionType.OVERTIME]:     'bg-[#fef2f2] text-[#991b1b]',
  [ExceptionType.WRONG_ZONE]:   'bg-[#eff6ff] text-[#1e40af]',
  [ExceptionType.UNPAID]:       'bg-[#fdf4ff] text-[#7e22ce]',
  [ExceptionType.OTHER]:        'bg-[#f5f5f4] text-[#57534e]',
};

// Short labels for type badges (hiển thị gọn)
const TYPE_SHORT_LABELS: Record<ExceptionType, string> = {
  [ExceptionType.LOST_CARD]:    'Mất vé',
  [ExceptionType.WRONG_PLATE]:  'Sai biển',
  [ExceptionType.OVERTIME]:     'Quá giờ',
  [ExceptionType.WRONG_ZONE]:   'Sai khu',
  [ExceptionType.UNPAID]:       'Chưa TT',
  [ExceptionType.OTHER]:        'Khác',
};

interface ExceptionTypeBadgeProps {
  type: ExceptionType;
  short?: boolean;
  className?: string;
}

/**
 * ExceptionTypeBadge — Badge loại ngoại lệ.
 */
export function ExceptionTypeBadge({ type, short = true, className }: ExceptionTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold',
        TYPE_STYLES[type],
        className
      )}
    >
      {short ? TYPE_SHORT_LABELS[type] : EXCEPTION_TYPE_LABELS[type]}
    </span>
  );
}
