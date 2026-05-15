import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Shield } from 'lucide-react';
import { UserRole } from '../../../../../../shared/types';
import { User as UserType } from '../../../../types/user.types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType; // If provided, it's edit mode
}

export function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  const isEdit = !!user;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.STAFF,
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: UserRole.STAFF,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">
                {isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isEdit ? 'Cập nhật thông tin nhân viên' : 'Tạo tài khoản Manager hoặc Staff'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  placeholder="Nhập họ và tên..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email đăng nhập</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required
                  disabled={isEdit}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="example@parkmaster.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  placeholder="09xx xxx xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò hệ thống</label>
              <div className="relative">
                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value={UserRole.STAFF}>Parking Staff</option>
                  <option value={UserRole.MANAGER}>Facility Manager</option>
                  <option value={UserRole.ADMIN}>System Admin</option>
                </select>
              </div>
            </div>

            {!isEdit && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ được gửi qua email của nhân viên. Nhân viên bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
                </p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm"
              >
                {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
