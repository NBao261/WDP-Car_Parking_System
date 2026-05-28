import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader — Tiêu đề trang chuẩn hóa.
 * Title + optional description + optional action buttons (góc phải).
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold text-[#060606]">{title}</h1>
        {description && (
          <p className="text-[13px] text-[#a0a0a0] mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
