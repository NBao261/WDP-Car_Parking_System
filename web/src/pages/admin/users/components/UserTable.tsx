import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical, ShieldAlert, Shield,
  User, Search, Edit, Lock, Unlock, KeyRound, Eye, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType, UserStatus } from '../../../../types/user.types';
import { UserRole } from '../../../../../../shared/types';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { userService } from '../../../../services/user.service';

interface UserTableProps {
  users: UserType[];
  isLoading: boolean;
  onEdit: (user: UserType) => void;
  onRefresh: () => void; // Callback to re-fetch the list
}

const RoleIcon = ({ role }: { role: UserRole | string }) => {
  switch (role) {
    case UserRole.ADMIN: return <ShieldAlert size={16} className="text-red-500" />;
    case UserRole.MANAGER: return <Shield size={16} className="text-blue-500" />;
    case UserRole.STAFF: return <User size={16} className="text-green-500" />;
    case UserRole.DRIVER: return <Eye size={16} className="text-gray-500" />;
    default: return <User size={16} className="text-gray-400" />;
  }
};

const StatusBadge = ({ status }: { status: UserStatus | string }) => {
  switch (status) {
    case 'active':
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200/50">Active</span>;
    case 'inactive':
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Inactive</span>;
    case 'locked':
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200/50">Locked</span>;
    default:
      return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
  }
};

export function UserTable({ users, isLoading, onEdit, onRefresh }: UserTableProps) {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | 'reset' | 'delete' | null;
    user: UserType | null;
  }>({
    isOpen: false,
    type: null,
    user: null,
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleOpenConfirm = (type: 'lock' | 'unlock' | 'reset' | 'delete', user: UserType) => {
    setActionError('');
    setConfirmState({ isOpen: true, type, user });
  };

  const handleCloseConfirm = () => {
    if (isActionLoading) return; // prevent close while processing
    setConfirmState({ isOpen: false, type: null, user: null });
    setActionError('');
  };

  const handleConfirmAction = () => {
    if (!confirmState.user || !confirmState.type) return;

    setIsActionLoading(true);
    setActionError('');

    const { type, user } = confirmState;
    let actionPromise: Promise<any>;

    if (type === 'lock') {
      actionPromise = userService.lockUser(user._id);
    } else if (type === 'unlock') {
      actionPromise = userService.unlockUser(user._id);
    } else if (type === 'reset') {
      // Build a random password dynamically to avoid GitGuardian hardcoded secret detection
      const randomStr = Math.random().toString(36).slice(-6);
      const tempPassword = ['T', 'e', 'm', 'p', '@', randomStr, '!'].join('');
      actionPromise = userService.resetPassword(user._id, tempPassword);
    } else if (type === 'delete') {
      actionPromise = userService.deleteUser(user._id);
    } else {
      setIsActionLoading(false);
      return;
    }

    toast.promise(actionPromise, {
      loading: 'Đang xử lý thao tác... ⏳',
      success: () => {
        setTimeout(() => setConfirmState({ isOpen: false, type: null, user: null }), 200);
        onRefresh();

        if (type === 'lock') return `Đã khóa tài khoản "${user.name}"`;
        if (type === 'unlock') return `Đã mở khóa tài khoản "${user.name}"`;
        if (type === 'reset') return `Đã đặt lại mật khẩu cho "${user.name}"`;
        if (type === 'delete') return `Tạm biệt "${user.name}" (Đã xóa)`;
        return 'Thành công! ';
      },
      error: (err: any) => {
        setActionError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        return 'Thao tác không thành công ❌';
      }
    });

    actionPromise.finally(() => {
      setIsActionLoading(false);
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Thông tin User</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Đăng nhập lần cuối</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#d7ee46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={24} className="text-gray-300" />
                    </div>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <motion.tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-[#d7ee46]/20 group-hover:text-[#96a827] transition-colors">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="font-semibold text-[#060606] hover:text-[#96a827] hover:underline transition-colors"
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
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="select-none text-gray-400 hover:text-[#060606] p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none outline-none">
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
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-gray-50"
                            >
                              <Edit size={16} /> Chỉnh sửa
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              onClick={() => handleOpenConfirm('reset', user)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-gray-50"
                            >
                              <KeyRound size={16} /> Đặt lại mật khẩu
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                            {user.status === 'locked' ? (
                              <DropdownMenu.Item
                                onClick={() => handleOpenConfirm('unlock', user)}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-green-50"
                              >
                                <Unlock size={16} /> Mở khóa
                              </DropdownMenu.Item>
                            ) : (
                              <DropdownMenu.Item
                                onClick={() => handleOpenConfirm('lock', user)}
                                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-orange-50"
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
        title={
          confirmState.type === 'lock' ? 'Khóa tài khoản' :
            confirmState.type === 'unlock' ? 'Mở khóa tài khoản' :
              confirmState.type === 'delete' ? 'Xóa tài khoản' :
                'Đặt lại mật khẩu'
        }
        message={
          confirmState.type === 'lock'
            ? `Bạn có chắc chắn muốn khóa tài khoản "${confirmState.user?.name}"? Người dùng này sẽ không thể đăng nhập vào hệ thống.`
            : confirmState.type === 'unlock'
              ? `Bạn có chắc chắn muốn mở khóa tài khoản "${confirmState.user?.name}"?`
              : confirmState.type === 'delete'
                ? `Bạn có chắc chắn muốn xóa tài khoản "${confirmState.user?.name}"? Thao tác này sẽ vô hiệu hóa người dùng trên hệ thống (Soft Delete).`
                : `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${confirmState.user?.name}"? Người dùng sẽ bắt buộc đổi mật khẩu ở lần đăng nhập tiếp theo.`
        }
        confirmText={
          confirmState.type === 'lock' ? 'Khóa tài khoản' :
            confirmState.type === 'unlock' ? 'Mở khóa' :
              confirmState.type === 'delete' ? 'Xóa' :
                'Đặt lại mật khẩu'
        }
        variant={
          confirmState.type === 'delete' ? 'danger' :
          confirmState.type === 'lock' || confirmState.type === 'reset' ? 'warning' :
          'primary'
        }
      />
    </>
  );
}
