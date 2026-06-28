import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Search,
  Edit,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Building2,
} from 'lucide-react';
import { User as UserType } from '../../../../types/user.types';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { RoleIcon } from '../../../../components/ui/RoleIcon';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { useUserActions } from '../hooks/useUserActions';

interface UserTableProps {
  users: UserType[];
  isLoading: boolean;
  onEdit: (user: UserType) => void;
  onRefresh: () => void;
  onAssignFacility: (user: UserType) => void;
}

export function UserTable({
  users,
  isLoading,
  onEdit,
  onRefresh,
  onAssignFacility,
  indexOffset = 0,
}: UserTableProps) {
  const {
    confirmState,
    isActionLoading,
    actionError,
    handleOpenConfirm,
    handleCloseConfirm,
    handleConfirmAction,
    confirmTitle,
    confirmMessage,
    confirmText,
    confirmVariant,
  } = useUserActions(onRefresh);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#FAFAFA] text-[#6b6b6b] text-[13px] border-b border-gray-100 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl w-[5%] text-center">STT</th>
                <th className="px-6 py-4 w-[25%]">Thông tin User</th>
                <th className="px-6 py-4 w-[15%]">Vai trò</th>
                <th className="px-6 py-4 w-[15%] text-center">Phân công</th>
                <th className="px-6 py-4 w-[15%]">Trạng thái</th>
                <th className="px-6 py-4 w-[15%]">Đăng nhập lần cuối</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#9FE870] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={24} className="text-gray-300" />
                    </div>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr key={user._id} className="hover:bg-[#9FE870]/10 transition-colors group">
                    <td className="px-6 py-4 text-[#6b6b6b] text-[13px] text-center font-medium">
                      {indexOffset + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-[#9FE870]/20 group-hover:text-[#062F28] transition-colors">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="font-semibold text-[#062F28] hover:text-[#062F28]/80 hover:underline transition-colors"
                          >
                            {user.name}
                          </Link>
                          <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center">
                          <RoleIcon role={user.role} />
                        </div>
                        <span className="font-medium capitalize">{user.role}</span>
                      </div>
                    </td>
                    {/* Phân công Tòa nhà — chỉ áp dụng cho Manager và Staff */}
                    <td className="px-6 py-4 text-center">
                      {user.role === 'manager' || user.role === 'staff' ? (
                        user.assignedFacilities && user.assignedFacilities.length > 0 ? (
                          (() => {
                            const count = user.assignedFacilities.length;
                            const opacity = Math.min(100, 10 + count * 10) / 100;
                            return (
                              <span
                                className="inline-flex items-center gap-1 text-[#062F28] font-bold text-xs px-3 py-1 rounded-full border border-[#9FE870]/60"
                                style={{ backgroundColor: `rgba(159, 232, 112, ${opacity})` }}
                              >
                                <span className="text-sm leading-none">{count}</span>
                                <span className="font-normal text-[10px] text-[#062F28]">Tòa Nhà</span>
                              </span>
                            );
                          })()
                        ) : (
                          <span className="inline-flex items-center bg-orange-50 text-orange-500 font-semibold text-[10px] px-2.5 py-1 rounded-full border border-orange-100">
                            Chưa phân công
                          </span>
                        )
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('vi-VN')
                        : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="select-none text-gray-400 hover:text-[#062F28] p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none outline-none">
                            <MoreVertical size={20} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="w-48 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                          >
                            <DropdownMenu.Item
                              onClick={() => onEdit(user)}
                              className="w-full text-left px-4 py-2 text-sm text-[#062F28] hover:bg-[#9FE870]/20 flex items-center gap-2 cursor-pointer outline-none focus:bg-[#9FE870]/20 transition-colors"
                            >
                              <Edit size={16} /> Chỉnh sửa
                            </DropdownMenu.Item>
                            {(user.role === 'manager' || user.role === 'staff') && (
                              <DropdownMenu.Item
                                onClick={() => onAssignFacility(user)}
                                className="w-full text-left px-4 py-2 text-sm text-[#062F28] hover:bg-[#9FE870]/20 flex items-center gap-2 cursor-pointer outline-none focus:bg-[#9FE870]/20 transition-colors"
                              >
                                <Building2 size={16} /> Phân công Tòa nhà
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Item
                              onClick={() => handleOpenConfirm('reset', user)}
                              className="w-full text-left px-4 py-2 text-sm text-[#062F28] hover:bg-[#9FE870]/20 flex items-center gap-2 cursor-pointer outline-none focus:bg-[#9FE870]/20 transition-colors"
                            >
                              <KeyRound size={16} /> Đặt lại mật khẩu
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                            {user.status === 'locked' ? (
                              <DropdownMenu.Item
                                onClick={() => handleOpenConfirm('unlock', user)}
                                className="w-full text-left px-4 py-2 text-sm text-[#062F28] hover:bg-[#9FE870]/20 flex items-center gap-2 cursor-pointer outline-none focus:bg-[#9FE870]/20 transition-colors"
                              >
                                <Unlock size={16} /> Mở khóa
                              </DropdownMenu.Item>
                            ) : (
                              <DropdownMenu.Item
                                onClick={() => handleOpenConfirm('lock', user)}
                                className="w-full text-left px-4 py-2 text-sm text-[#062F28] hover:bg-[#9FE870]/20 flex items-center gap-2 cursor-pointer outline-none focus:bg-[#9FE870]/20 transition-colors"
                              >
                                <Lock size={16} /> Khóa tài khoản
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                            <DropdownMenu.Item
                              onClick={() => handleOpenConfirm('delete', user)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-red-50"
                            >
                              <Trash2 size={16} /> Xóa tài khoản
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
        error={actionError}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        variant={confirmVariant}
      />
    </>
  );
}
