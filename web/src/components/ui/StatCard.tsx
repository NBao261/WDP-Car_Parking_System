import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  /** dark = true → dùng nền #1a1a1a text trắng */
  dark?: boolean;
  trend?: { value: number; label?: string };
  className?: string;
}

/**
 * StatCard — KPI card tái sử dụng cho tất cả Manager + Admin pages.
 * Thay thế các <div className="bg-white p-5 rounded-xl..."> viết thủ công.
 */
export function StatCard({ label, value, sub, icon, dark, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 flex flex-col gap-2',
        dark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white' : 'bg-white border-[#e8e9e8] text-[#060606]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'text-[11px] font-bold uppercase tracking-wider',
            dark ? 'text-[#a0a0a0]' : 'text-[#a0a0a0]'
          )}
        >
          {label}
        </span>
        {icon && (
          <span className={cn('shrink-0', dark ? 'text-[#d7ee46]' : 'text-[#6b6b6b]')}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none">{value}</span>
        {sub && (
          <span className={cn('text-[13px] font-medium', dark ? 'text-[#a0a0a0]' : 'text-[#6b6b6b]')}>
            {sub}
          </span>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={cn(
              'text-[11px] font-bold',
              trend.value >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span className={cn('text-[11px]', dark ? 'text-[#a0a0a0]' : 'text-[#a0a0a0]')}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
