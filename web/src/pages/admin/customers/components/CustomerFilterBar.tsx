import { Search, Filter, X } from 'lucide-react';
import { UserRole } from '../../../../../../shared/types';
import { CustomDropdown } from '../../../../components/ui/CustomDropdown';

interface CustomerFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function CustomerFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: CustomerFilterBarProps) {
  const hasFilters = searchTerm !== '' || statusFilter !== 'ALL';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
      {/* Label */}
      <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 shrink-0">
        <Filter size={14} />
        Bộ lọc:
      </div>

      <div className="relative w-[300px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tên, số điện thoại..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:border-transparent transition-all"
        />
      </div>

      <div className="w-[180px]">
        <CustomDropdown
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'locked', label: 'Bị khóa' },
          ]}
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => { onSearchChange(''); onStatusFilterChange('ALL'); }}
          className="flex items-center gap-1.5 text-[13px] text-red-500 hover:text-red-600 font-medium whitespace-nowrap px-3 py-2 rounded-xl hover:bg-red-50 transition-colors ml-auto"
        >
          <X size={14} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
