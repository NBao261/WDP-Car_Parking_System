import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../../../../types/role.types';
import { roleService } from '../../../../services/role.service';

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

// Group standard permissions by module for the UI
const PERMISSION_MODULES = [
  {
    id: 'users',
    name: 'Quản lý Tài khoản & Phân quyền',
    permissions: [
      { id: 'users:read', label: 'Xem danh sách người dùng' },
      { id: 'users:write', label: 'Tạo/sửa người dùng' },
      { id: 'users:delete', label: 'Xóa/khóa người dùng' },
      { id: 'roles:manage', label: 'Quản lý phân quyền' },
    ]
  },
  {
    id: 'facilities',
    name: 'Quản lý Bãi xe & Khu vực',
    permissions: [
      { id: 'facilities:read', label: 'Xem danh sách bãi xe' },
      { id: 'facilities:write', label: 'Cấu hình bãi xe mới' },
      { id: 'zones:read', label: 'Xem khu vực (Zones)' },
      { id: 'zones:write', label: 'Cấu hình khu vực' },
    ]
  },
  {
    id: 'operations',
    name: 'Vận hành & Xe cộ',
    permissions: [
      { id: 'vehicles:read', label: 'Xem danh sách xe' },
      { id: 'vehicles:write', label: 'Đăng ký xe thẻ tháng' },
      { id: 'checkin:manage', label: 'Thực hiện Check-in / Check-out' },
      { id: 'gates:control', label: 'Điều khiển Barie / Cổng' },
    ]
  },
  {
    id: 'billing',
    name: 'Doanh thu & Báo cáo',
    permissions: [
      { id: 'billing:read', label: 'Xem báo cáo doanh thu' },
      { id: 'billing:export', label: 'Xuất báo cáo (Export)' },
      { id: 'pricing:manage', label: 'Cấu hình bảng giá' },
    ]
  }
];

export function PermissionMatrixModal({ isOpen, onClose, role, onSuccess }: PermissionMatrixModalProps) {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role && isOpen) {
      setSelectedPerms(new Set(role.permissions || []));
      setError('');
    }
  }, [role, isOpen]);

  if (!isOpen || !role) return null;

  const handleToggle = (permId: string) => {
    const newPerms = new Set(selectedPerms);
    if (newPerms.has(permId)) {
      newPerms.delete(permId);
    } else {
      newPerms.add(permId);
    }
    setSelectedPerms(newPerms);
  };

  const handleSave = () => {
    setIsSaving(true);
    setError('');
    
    const savePromise = roleService.updatePermissions(role._id, Array.from(selectedPerms));

    toast.promise(savePromise, {
      loading: 'Đang lưu cấu hình phân quyền...',
      success: () => {
        onSuccess();
        setTimeout(() => onClose(), 200);
        return `Đã lưu cấu hình phân quyền cho "${role.name}".`;
      },
      error: (err: any) => {
        setError(err.message || 'Đã xảy ra lỗi khi lưu quyền.');
        return 'Thao tác không thành công.';
      }
    });

    savePromise.finally(() => {
      setIsSaving(false);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d7ee46]/20 flex items-center justify-center">
                <Shield size={20} className="text-[#96a827]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#060606]">Cấu hình Quyền</h2>
                <p className="text-xs text-gray-500 mt-0.5">Role: <span className="font-semibold text-gray-700">{role.name}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Warning for Default Roles */}
          {role.isDefault && (
            <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100 flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">⚠️</span>
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                Đây là nhóm quyền hệ thống. Việc thay đổi cấu hình tại đây sẽ <strong>áp dụng ngay lập tức cho toàn bộ người dùng</strong> đang giữ chức vụ này. Hãy cẩn trọng!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 px-6 py-3 border-b border-red-100">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {PERMISSION_MODULES.map((mod, idx) => (
              <motion.div 
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 font-bold text-[#060606] text-sm flex justify-between items-center">
                  {mod.name}
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {mod.permissions.filter(p => selectedPerms.has(p.id)).length} / {mod.permissions.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {mod.permissions.map((perm) => {
                    const isChecked = selectedPerms.has(perm.id);
                    return (
                      <label 
                        key={perm.id} 
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 cursor-pointer group transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#060606] transition-colors">{perm.label}</span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{perm.id}</span>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-md border flex items-center justify-center transition-all
                          ${isChecked ? 'bg-[#d7ee46] border-[#c4dc32]' : 'bg-white border-gray-200 group-hover:border-gray-300'}
                        `}>
                          {isChecked && <Check size={14} className="text-[#060606]" strokeWidth={3} />}
                        </div>
                        {/* Hidden actual checkbox for accessibility */}
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={isChecked}
                          onChange={() => handleToggle(perm.id)}
                        />
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Lưu thay đổi
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
