import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { roleService } from '../../../../services/role.service';
import { Role } from '../../../../types/role.types';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { RoleIcon } from '../../../../components/ui/RoleIcon';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Key, Trash2 } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  onConfigPerms: (role: Role) => void;
  onDeleted: (roleId: string) => void; // notify parent after delete
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function RoleCard({ role, onConfigPerms, onDeleted }: RoleCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await roleService.deleteRole(role._id);
      onDeleted(role._id);
    } catch (err: any) {
      setDeleteError(err.message || 'Không thể xóa role này. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  }, [role._id, onDeleted]);

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:border-[#9FE870]/50 transition-colors group relative"
      >
        {/* Card Header */}
        <div className="p-6 border-b border-gray-50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#9FE870]/10 group-hover:border-[#9FE870]/30 transition-colors">
              <RoleIcon role={role.code} size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#062F28] text-[17px] leading-tight">{role.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-mono font-semibold text-[#6b6b6b] bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                  {role.code}
                </span>
                {role.isDefault && (
                  <span className="text-[10px] uppercase font-bold text-[#062F28] bg-[#9FE870]/20 px-2 py-0.5 rounded-md border border-[#9FE870]/30">
                    System Role
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="select-none p-2 text-gray-400 hover:text-[#062F28] bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none outline-none">
                <MoreVertical size={18} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="w-52 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              >
                <DropdownMenu.Item
                  onClick={() => onConfigPerms(role)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-gray-50"
                >
                  <Key size={16} /> Cấu hình quyền hạn
                </DropdownMenu.Item>

                {/* Chỉ hiện Xóa nếu KHÔNG phải System Role */}
                {!role.isDefault && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                    <DropdownMenu.Item
                      onClick={() => {
                        setDeleteError('');
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer outline-none focus:bg-red-50"
                    >
                      <Trash2 size={16} /> Xóa Role này
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-gray-500 text-sm leading-relaxed flex-1">{role.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Key size={14} className="text-gray-400" />
              {role.permissions?.length || 0} Permissions
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {role.isDefault ? 'Vai trò cố định' : 'Vai trò tùy chỉnh'}
          </span>
          <button
            onClick={() => onConfigPerms(role)}
            className="text-[13px] font-bold text-white bg-[#062F28] hover:bg-[#9FE870] hover:text-[#062F28] px-4 py-1.5 rounded-full border border-[#062F28] hover:border-[#9FE870] transition-colors flex items-center gap-1"
          >
            Cấu hình quyền <span className="leading-none">→</span>
          </button>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa Role"
        message={`Bạn có chắc chắn muốn xóa role "${role.name}" không? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các người dùng đang sử dụng role này.`}
        confirmText="Xóa Role"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}
