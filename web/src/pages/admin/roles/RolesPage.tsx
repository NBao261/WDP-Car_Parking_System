import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Search, Plus, Trash2, Edit2, ChevronDown, ArrowDown, ArrowUpRight, ShieldAlert, Key } from 'lucide-react';
import { roleService } from '../../../services/role.service';
import { Role } from '../../../types/role.types';
import { PermissionMatrixModal } from './components/PermissionMatrixModal';
import { RoleCard } from './components/RoleCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Permission Matrix modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles', error);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleRoleDeleted = useCallback((roleId: string) => {
    setRoles((prev) => prev.filter((r) => r._id !== roleId));
  }, []);

  const handleConfigPerms = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsPermModalOpen(true);
  }, []);

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Overview Cards (Same layout as Users Page) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Green Overview Card */}
        <div className="bg-[#9FE870] p-6 rounded-[24px] shadow-sm text-[#062F28] flex flex-col justify-between relative overflow-hidden min-h-[220px]">
          {/* Decorative background shapes simulating the image's waves */}
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full border-[30px] border-white/20 blur-[2px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full border-[40px] border-white/10 blur-[2px] pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <h3 className="font-medium text-[16px]">Tổng số vai trò</h3>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
              <Shield size={20} strokeWidth={2} />
            </div>
          </div>
          
          <div className="relative z-10 mt-2 mb-8">
             <div className="text-[44px] leading-none font-bold flex items-baseline gap-2">
               {roles.length} <span className="text-[16px] font-medium opacity-90">ROLES</span>
             </div>
          </div>
          
          <div className="relative z-10 flex gap-3 mt-auto">
            <div className="bg-white text-black px-4 py-3 rounded-full text-[14px] font-medium flex-1 flex justify-center items-center gap-2 shadow-sm">
              {filteredRoles.length} Vai trò mặc định 
              <div className="w-4 h-4 rounded-full bg-[#9FE870] flex items-center justify-center">
                <ArrowDown size={10} className="text-[#062F28]" strokeWidth={3}/>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Cards & Search */}
        <div className="bg-gradient-to-b from-[#f8f9fa] to-[#efefef] p-6 pt-16 rounded-[24px] shadow-sm border-4 border-white lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#9FE870] px-6 py-3 rounded-br-[24px] z-10">
            <h3 className="font-bold text-[15px] text-[#062F28]">Phân quyền & Truy cập</h3>
          </div>
          <div className="grid grid-cols-1 gap-5 mb-5 relative z-10">
            <div className="p-5 bg-white rounded-[20px] border-2 border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#9FE870]/20 flex items-center justify-center border border-[#9FE870]/30">
                  <ShieldAlert size={18} className="text-[#062F28]" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">Cấu trúc Phân Quyền</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Cố định & Mở rộng</div>
              <p className="text-[#6b6b6b] text-[12px] leading-relaxed font-semibold">
                Hệ thống sử dụng các <span className="text-[#062F28]">Vai trò cố định</span> để đảm bảo nghiệp vụ lõi (Admin, Manager, Staff, Driver). <br className="hidden md:block"/>
                Để phân quyền chi tiết cho nghiệp vụ đặc thù mới phát sinh, vui lòng chỉnh sửa <span className="text-[#062F28]">Quyền tùy chỉnh</span> trực tiếp trên từng Nhân sự tại trang Quản lý Nhân Sự.
              </p>
            </div>
          </div>
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vai trò theo tên/mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-8 h-8 border-4 border-[#9FE870] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải danh sách vai trò...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-6">
          {filteredRoles.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Danh sách vai trò hệ thống ({filteredRoles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoles.map((role) => (
                  <RoleCard
                    key={role._id}
                    role={role}
                    onConfigPerms={handleConfigPerms}
                    onDeleted={handleRoleDeleted}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredRoles.length === 0 && (
            <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              {searchTerm
                ? `Không tìm thấy vai trò nào phù hợp với "${searchTerm}".`
                : 'Chưa có vai trò nào.'}
            </div>
          )}
        </motion.div>
      )}

      {/* Permission Matrix Modal */}
      <PermissionMatrixModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        role={selectedRole}
        onSuccess={fetchRoles}
      />
    </motion.div>
  );
}
