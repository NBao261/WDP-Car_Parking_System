import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { Role } from '../../../../types/role.types';
import { apiClient } from '../../../../services/api'; // Direct fallback if service lacks create

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role; // If provided, it's edit mode (though we might only edit permissions usually)
  onSuccess: () => void;
}

export function RoleFormModal({ isOpen, onClose, role, onSuccess }: RoleFormModalProps) {
  const isEdit = !!role;
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role && isOpen) {
      setFormData({
        name: role.name,
        code: role.code,
        description: role.description,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        code: 'ROLE_',
        description: '',
      });
    }
    setError('');
  }, [role, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      // In a real app, use roleService.createRole or roleService.updateRole
      if (isEdit) {
        // mock edit
      } else {
        await apiClient.post('/roles', { ...formData, permissions: [] });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu vai trò');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d7ee46]/20 flex items-center justify-center">
                <Shield size={20} className="text-[#96a827]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#060606]">
                  {isEdit ? 'Chỉnh sửa Role' : 'Tạo Role Mới'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Định nghĩa một vai trò mới trong hệ thống
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 px-6 py-3 border-b border-red-100">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Vai trò</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                placeholder="VD: Kế toán trưởng"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã Role (Code)</label>
              <input 
                type="text" 
                required
                disabled={isEdit}
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="ROLE_ACCOUNTANT"
              />
              <p className="text-xs text-gray-400 mt-1.5">Dùng để kiểm tra quyền trong code. Phải bắt đầu bằng ROLE_</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết</label>
              <textarea 
                rows={3}
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                placeholder="Mô tả quyền hạn và trách nhiệm của vai trò này..."
              />
            </div>

            {/* Footer Buttons */}
            <div className="mt-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
