import { Search, Filter, Calendar } from 'lucide-react';
import { ReservationStatus } from '../../../../services/reservation.service';

interface ReservationFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ReservationFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ReservationFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đặt chỗ, biển số xe..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d7ee46] appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={ReservationStatus.PENDING}>Chờ duyệt</option>
            <option value={ReservationStatus.CONFIRMED}>Đã xác nhận</option>
            <option value={ReservationStatus.USED}>Đã sử dụng</option>
            <option value={ReservationStatus.CANCELLED}>Đã hủy</option>
            <option value={ReservationStatus.EXPIRED}>Hết hạn</option>
          </select>
        </div>
      </div>
    </div>
  );
}
