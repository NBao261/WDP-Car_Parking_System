import { Filter, X } from 'lucide-react';
import { CustomDropdown } from '../../../../components/ui/CustomDropdown';

interface LogsFilterBarProps {
  actionFilter: string;
  onActionFilterChange: (action: string) => void;
  entityFilter: string;
  onEntityFilterChange: (entity: string) => void;
}

const ACTION_OPTIONS = [
  { value: '', label: 'Tất cả hành động' },
  { value: 'CREATE', label: 'Tạo mới' },
  { value: 'UPDATE', label: 'Cập nhật' },
  { value: 'DELETE', label: 'Xoá' },
  { value: 'LOGIN', label: 'Đăng nhập' },
  { value: 'LOGOUT', label: 'Đăng xuất' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'Tất cả đối tượng' },
  { value: 'User', label: 'Người dùng' },
  { value: 'ParkingFacility', label: 'Tòa nhà / Bãi xe' },
  { value: 'Floor', label: 'Tầng / Khu vực' },
  { value: 'ParkingSlot', label: 'Vị trí đỗ xe' },
  { value: 'Vehicle', label: 'Phương tiện' },
  { value: 'ParkingSession', label: 'Phiên đỗ xe' },
  { value: 'SystemConfig', label: 'Cấu hình hệ thống' },
];

export function LogsFilterBar({
  actionFilter,
  onActionFilterChange,
  entityFilter,
  onEntityFilterChange,
}: LogsFilterBarProps) {
  const hasFilters = actionFilter !== '' || entityFilter !== '';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
      {/* Label */}
      <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 shrink-0">
        <Filter size={14} />
        Bộ lọc:
      </div>

      {/* Action Filter */}
      <div className="w-[200px]">
        <CustomDropdown
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={onActionFilterChange}
          placeholder="Loại hành động"
        />
      </div>

      {/* Entity Filter */}
      <div className="w-[220px]">
        <CustomDropdown
          options={ENTITY_OPTIONS}
          value={entityFilter}
          onChange={onEntityFilterChange}
          placeholder="Đối tượng"
        />
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={() => { onActionFilterChange(''); onEntityFilterChange(''); }}
          className="flex items-center gap-1.5 text-[13px] text-red-500 hover:text-red-600 font-medium whitespace-nowrap px-3 py-2 rounded-xl hover:bg-red-50 transition-colors ml-auto"
        >
          <X size={14} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
