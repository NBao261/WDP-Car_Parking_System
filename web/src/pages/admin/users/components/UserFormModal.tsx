import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../../../../../../shared/types';
import { User as UserType } from '../../../../types/user.types';
import { userService } from '../../../../services/user.service';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType; // If provided, it's edit mode
  onSuccess: () => void; // Callback to refresh parent list
}

export function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.STAFF as UserRole,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '',
        role: user.role,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: UserRole.STAFF,
      });
    }
    setError('');
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const actionPromise = isEdit && user
      ? userService.updateUser(user._id, {
          name: formData.name,
          phone: formData.phone,
        })
      : userService.createUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        });

    toast.promise(actionPromise, {
      loading: isEdit ? 'Đang lưu thay đổi...' : 'Đang khởi tạo tài khoản...',
      success: () => {
        onSuccess();
        setTimeout(() => onClose(), 200); // Delay slightly for a smoother visual exit
        return isEdit ? 'Cập nhật thông tin thành công.' : 'Tạo tài khoản thành công.';
      },
      error: (err: any) => {
        setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        return 'Thao tác không thành công.';
      },
    });

    actionPromise.finally(() => {
      setIsSubmitting(false);
    });
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
          onClick={!isSubmitting ? onClose : undefined}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
              onClick={!isSubmitting ? onClose : undefined}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="example@parkmaster.com"
                />
              </div>
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1.5">Email không thể thay đổi sau khi tạo tài khoản.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  placeholder="09xx xxx xxx"
                />
              </div>
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu khởi tạo</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Mật khẩu cấp lần đầu cho nhân viên.</p>
              </div>
            )}

            {/* Role select: only for Create mode - backend blocks direct role update via PATCH */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vai trò hệ thống</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value={UserRole.ADMIN}>System Admin</option>
                    <option value={UserRole.MANAGER}>Facility Manager</option>
                    <option value={UserRole.STAFF}>Parking Staff</option>
                    <option value={UserRole.DRIVER}>Driver / Customer</option>
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Để thay đổi vai trò sau khi tạo, dùng chức năng "Gán Role" trong trang Phân quyền.
                </p>
              </div>
            )}



            {/* Footer Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : isEdit ? (
                  'Lưu thay đổi'
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
