import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldAlert,
  Building2,
  Lock,
  Unlock,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { userService } from '../../../services/user.service';
import { User as UserType } from '../../../types/user.types';
import { UserRole } from '../../../../../shared/types';
import { Skeleton } from '../../../components/ui/Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await userService.getUserById(id);
      setUser(res.data);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải thông tin nhân sự');
      navigate('/admin/staff');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleLock = async () => {
    if (!user) return;
    setIsActionLoading(true);
    try {
      if (user.status === 'locked') {
        await userService.unlockUser(user._id);
        toast.success('Đã mở khóa tài khoản thành công');
      } else {
        await userService.lockUser(user._id);
        toast.success('Đã khóa tài khoản thành công');
      }
      fetchUser();
    } catch (error: any) {
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn reset mật khẩu tài khoản này về mặc định không?'
    );
    if (!confirm) return;

    setIsActionLoading(true);
    try {
      await userService.resetPassword(user._id, 'password123'); // Assume default is password123 or from backend
      toast.success('Đã reset mật khẩu thành công. Mật khẩu mới: password123', { duration: 5000 });
    } catch (error: any) {
      toast.error(error.message || 'Reset mật khẩu thất bại');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
            System Admin
          </span>
        );
      case UserRole.MANAGER:
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
            Facility Manager
          </span>
        );
      case UserRole.STAFF:
        return (
          <span className="bg-[#9FE870]/20 text-[#062F28] px-3 py-1 rounded-full text-xs font-bold border border-[#9FE870]/30">
            Parking Staff
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
            {role.toUpperCase()}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
            <CheckCircle2 size={16} /> Đang hoạt động
          </div>
        );
      case 'locked':
        return (
          <div className="flex items-center gap-1.5 text-red-600 text-sm font-semibold">
            <Lock size={16} /> Đang bị khóa
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold">
            <AlertCircle size={16} /> Chưa kích hoạt
          </div>
        );
      default:
        return <div className="text-gray-500">{status}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderSecurityCard = () => (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
      <h3 className="text-[15px] font-bold text-[#062F28] mb-4 flex items-center gap-2">
        <Lock size={18} className="text-[#9FE870]" />
        Bảo mật & Quản lý
      </h3>

      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-xs text-gray-500 mb-1">Đăng nhập lần cuối</div>
          <div className="text-sm font-semibold text-gray-900">
            {user.lastLogin
              ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm:ss')
              : 'Chưa từng đăng nhập'}
          </div>
        </div>

        <button
          onClick={handleResetPassword}
          disabled={isActionLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isActionLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          Đặt lại mật khẩu
        </button>

        {user.status === 'locked' ? (
          <button
            onClick={handleToggleLock}
            disabled={isActionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-100 font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isActionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Unlock size={16} />
            )}
            Mở khóa tài khoản
          </button>
        ) : (
          <button
            onClick={handleToggleLock}
            disabled={isActionLoading || user.role === UserRole.ADMIN}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 border border-red-100 text-red-700 rounded-xl hover:bg-red-100 font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Lock size={16} />
            )}
            Khóa tài khoản
          </button>
        )}
        {user.role === UserRole.ADMIN && (
          <p className="text-xs text-red-500 text-center">Không thể khóa tài khoản Admin</p>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/staff')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm border border-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#062F28]">Hồ sơ Nhân sự</h1>
          <p className="text-gray-500 text-sm mt-1">Chi tiết tài khoản và phân quyền</p>
        </div>
      </motion.div>

      <div className={`grid grid-cols-1 ${user.role === UserRole.ADMIN ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
        {/* Cột trái: Thông tin cá nhân & Bảo mật */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-[#062F28] to-[#125B4F]"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white absolute -top-10 left-6 text-[#062F28]">
                {user.role === UserRole.ADMIN ? (
                  <ShieldAlert size={36} className="text-red-500" />
                ) : user.role === UserRole.MANAGER ? (
                  <Shield size={36} className="text-blue-500" />
                ) : (
                  <User size={36} className="text-[#9FE870]" />
                )}
              </div>

              <div className="pt-14">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  {getRoleBadge(user.role)}
                </div>
                {getStatusBadge(user.status)}

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Số điện thoại</div>
                      <div className="font-medium text-gray-900">{user.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Ngày tạo tài khoản</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          {user.role !== UserRole.ADMIN && renderSecurityCard()}
        </motion.div>

        {/* Cột phải: Công việc & Phân quyền */}
        <motion.div variants={itemVariants} className={`${user.role === UserRole.ADMIN ? '' : 'lg:col-span-2'} space-y-6`}>
          {user.role === UserRole.ADMIN && renderSecurityCard()}
          {/* Work Assignments */}
          {(user.role === UserRole.MANAGER || user.role === UserRole.STAFF) && (
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-[#062F28]">Phân công khu vực (Bãi đỗ)</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Các bãi xe mà nhân sự này được phép quản lý/vận hành
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Building2 size={20} />
              </div>
            </div>

            <div className="p-6">
              {user.assignedFacilities && user.assignedFacilities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.assignedFacilities.map((facility: any, idx: number) => {
                    const isObject = typeof facility === 'object';
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#9FE870]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 size={18} className="text-[#062F28]" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm line-clamp-1">
                            {isObject
                              ? facility.name || 'Bãi đỗ chưa đặt tên'
                              : `Facility ID: ${facility}`}
                          </div>
                          {isObject && facility.address && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                              {facility.address}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <Building2 size={32} className="mx-auto text-gray-300 mb-3" />
                  <div className="text-sm font-medium text-gray-900">Chưa được phân công</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Nhân sự này chưa được gán vào bất kỳ bãi xe nào.
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* RBAC Permissions */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-[#062F28]">Quyền hệ thống (RBAC)</h3>
                <p className="text-xs text-gray-500 mt-1">Danh sách các nhóm quyền của tài khoản</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <Shield size={20} />
              </div>
            </div>

            <div className="p-6">
              {user.role === UserRole.ADMIN ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <ShieldAlert size={20} className="text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-800 text-sm">
                      Toàn quyền hệ thống (Full Access)
                    </div>
                    <div className="text-xs text-emerald-600 mt-1 leading-relaxed">
                      Admin có toàn quyền truy cập tất cả các tính năng và dữ liệu trên hệ thống.
                    </div>
                  </div>
                </div>
              ) : user.role === UserRole.MANAGER ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Quản lý cơ sở vật chất và sơ đồ bãi đỗ
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Cấu hình giá và khuyến mãi của bãi được phân công
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Quản lý nhân viên vận hành (Staff)
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Xem báo cáo doanh thu bãi đỗ
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Vận hành làn xe (Check-in / Check-out)
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Thu phí tiền mặt tại trạm
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Giám sát camera LPR trong ca trực
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex gap-3 items-center">
                    <CheckCircle2 size={16} className="text-[#9FE870]" />
                    <span className="text-sm font-medium text-gray-800">
                      Ghi nhận ngoại lệ (Exception Handling)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
