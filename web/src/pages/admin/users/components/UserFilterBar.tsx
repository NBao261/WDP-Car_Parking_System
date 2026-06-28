import { Search, Filter } from 'lucide-react';
import { UserRole } from '../../../../../../shared/types';

interface UserFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export function UserFilterBar({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UserFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:border-transparent transition-all"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9FE870] appearance-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.MANAGER}>Manager</option>
            <option value={UserRole.STAFF}>Staff</option>
            <option value={UserRole.DRIVER}>Driver</option>
          </select>
        </div>
      </div>
    </div>
  );
}
