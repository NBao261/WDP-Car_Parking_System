import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../../../../types/role.types';
import { roleService } from '../../../../services/role.service';
import { PERMISSION_GROUPS } from '../../../../constants/permissions';
import { PermissionGroupList } from '../../../../components/ui/PermissionGroupList';

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

const totalPermCount = PERMISSION_GROUPS.reduce((sum, g) => sum + g.permissions.length, 0);

export function PermissionMatrixModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: PermissionMatrixModalProps) {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');

  // Sync permissions from role when modal opens
  useEffect(() => {
    if (role && isOpen) {
      setSelectedPerms(new Set(role.permissions || []));
      setError('');
    }
  }, [role, isOpen]);

  const handleToggle = (permId: string) => {
    const newPerms = new Set(selectedPerms);
    if (newPerms.has(permId)) {
      newPerms.delete(permId);
    } else {
      newPerms.add(permId);
    }
    setSelectedPerms(newPerms);
  };

  const handleToggleGroup = (groupPermIds: string[]) => {
    const allChecked = groupPermIds.every((id) => selectedPerms.has(id));
    const newPerms = new Set(selectedPerms);
    if (allChecked) {
      groupPermIds.forEach((id) => newPerms.delete(id));
    } else {
      groupPermIds.forEach((id) => newPerms.add(id));
    }
    setSelectedPerms(newPerms);
  };

  const handleSave = () => {
    if (!role) return;
    setIsSaving(true);
    setError('');

    const savePromise = roleService.updatePermissions(role._id, Array.from(selectedPerms));

    toast.promise(savePromise, {
      loading: 'Đang lưu cấu hình phân quyền...',
      success: () => {
        onSuccess();
        setTimeout(() => onClose(), 200);
        return `Đã lưu cấu hình quyền cho "${role.name}".`;
      },
      error: (err: any) => {
        setError(err.message || 'Đã xảy ra lỗi khi lưu quyền.');
        return 'Thao tác không thành công.';
      },
    });

    savePromise.finally(() => setIsSaving(false));
  };

  const handleReset = () => {
    if (!role) return;
    setIsResetting(true);
    setError('');

    const resetPromise = roleService.resetPermissions(role._id);

    toast.promise(resetPromise, {
      loading: 'Đang reset quyền về mặc định...',
      success: (res) => {
        setSelectedPerms(new Set(res.data.permissions || []));
        onSuccess();
        return `Đã reset quyền về mặc định cho "${role.name}".`;
      },
      error: (err: any) => {
        setError(err.message || 'Không thể reset quyền.');
        return 'Thao tác không thành công.';
      },
    });

    resetPromise.finally(() => setIsResetting(false));
  };

  return (
    <AnimatePresence>
      {isOpen && role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSaving ? onClose : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col"
            style={{ maxHeight: 'min(90vh, 720px)' }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d7ee46]/20 flex items-center justify-center">
                  <Shield size={20} className="text-[#96a827]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#060606]">Cấu hình Quyền hạn</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Role: <span className="font-semibold text-gray-700">{role.name}</span>
                    <span className="ml-2 font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {role.code}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={!isSaving ? onClose : undefined}
                disabled={isSaving}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            {/* Warnings */}
            {role.isDefault && (
              <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Đây là <strong>vai trò hệ thống mặc định</strong>. Thay đổi sẽ áp dụng ngay cho
                  toàn bộ người dùng đang giữ chức vụ này.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 px-6 py-3 border-b border-red-100">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Summary bar */}
            <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Đã chọn: <span className="font-bold text-[#060606]">{selectedPerms.size}</span> /{' '}
                {totalPermCount} quyền
              </span>
              {role.isDefault && (
                <button
                  onClick={handleReset}
                  disabled={isResetting || isSaving}
                  className="text-xs text-gray-500 hover:text-[#060606] flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  Reset về mặc định
                </button>
              )}
            </div>

            {/* Permission Groups — scrollable area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <PermissionGroupList
                selectedPerms={selectedPerms}
                onToggle={handleToggle}
                allowGroupToggle={true}
                onToggleGroup={handleToggleGroup}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={!isSaving ? onClose : undefined}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isResetting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
