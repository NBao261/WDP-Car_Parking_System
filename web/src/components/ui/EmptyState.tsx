import { cn } from '../../lib/utils';
import { SearchX, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: 'search' | 'empty';
}

/**
 * EmptyState — Hiển thị khi bảng/danh sách không có dữ liệu.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = 'empty',
}: EmptyStateProps) {
  const defaultIcon = variant === 'search'
    ? <SearchX size={32} className="text-[#a0a0a0]" />
    : <Inbox size={32} className="text-[#a0a0a0]" />;

  const defaultTitle = variant === 'search' ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu';
  const defaultDesc = variant === 'search'
    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
    : 'Dữ liệu sẽ xuất hiện tại đây sau khi có hoạt động';

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3 text-center', className)}>
      {icon ?? defaultIcon}
      <div>
        <p className="font-semibold text-[14px] text-[#060606]">{title ?? defaultTitle}</p>
        <p className="text-[12px] text-[#a0a0a0] mt-1">{description ?? defaultDesc}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
