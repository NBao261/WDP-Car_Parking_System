import { Users, Search, RefreshCw, AlertCircle, Settings2 } from 'lucide-react';
import { User, AssignedFacility } from '../../../types/user.types';

interface StaffManagementTabProps {
  staffList: User[];
  staffLoading: boolean;
  staffError: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchStaff: () => void;
  managerFacilities: AssignedFacility[];
  onAssignClick: (staff: User) => void;
}

export function StaffManagementTab({
  staffList,
  staffLoading,
  staffError,
  searchTerm,
  setSearchTerm,
  fetchStaff,
  managerFacilities,
  onAssignClick,
}: StaffManagementTabProps) {
  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStaffFacilityNames = (staff: User): string => {
    const facilities = staff.assignedFacilities ?? [];
    if (facilities.length === 0) return 'Chưa phân công';
    return facilities
      .map((f) => (typeof f === 'string' ? f : (f as AssignedFacility).name))
      .join(', ');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d7ee46] transition-colors"
          />
        </div>
        <button
          onClick={fetchStaff}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${staffLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cảnh báo khi Manager chưa được gán tòa nhà */}
      {managerFacilities.length === 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Bạn chưa được phân công quản lý tòa nhà nào</p>
            <p className="text-xs text-amber-700 mt-0.5">Vui lòng liên hệ Admin để được cấp quyền quản lý tòa nhà trước khi có thể phân công cho nhân viên.</p>
          </div>
        </div>
      )}

      {/* Staff table */}
      {staffError ? (
        <div className="p-6 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {staffError}
          <button onClick={fetchStaff} className="ml-2 underline font-bold">Thử lại</button>
        </div>
      ) : staffLoading ? (
        <div className="p-12 flex flex-col items-center gap-2 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-xs">Đang tải danh sách nhân viên...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">{searchTerm ? 'Không tìm thấy nhân viên phù hợp.' : 'Chưa có nhân viên nào.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">Nhân viên</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">Tòa nhà được phân công</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500">Trạng thái</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#060606]">{staff.name}</p>
                      <p className="text-xs text-gray-400">{staff.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-xs ${staff.assignedFacilities?.length === 0 ? 'text-amber-500 font-semibold' : 'text-gray-600'}`}>
                      {getStaffFacilityNames(staff)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      staff.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : staff.status === 'locked'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onAssignClick(staff)}
                      disabled={managerFacilities.length === 0}
                      title={managerFacilities.length === 0 ? "Vui lòng liên hệ Admin để được cấp quyền quản lý tòa nhà trước" : ""}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#d7ee46] hover:bg-[#c4dc32] text-[#060606] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                    >
                      <Settings2 size={12} />
                      Phân công
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
