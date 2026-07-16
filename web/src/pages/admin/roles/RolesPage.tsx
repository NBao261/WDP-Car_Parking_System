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
        <div className="bg-[#9FE870] p-6 rounded-[24px] shadow-sm text-[#062F28] flex flex-col relative overflow-hidden min-h-[180px] h-full">
          {/* Decorative background shapes simulating the image's waves */}
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full border-[30px] border-white/20 blur-[2px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full border-[40px] border-white/10 blur-[2px] pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-2">
            <h3 className="font-bold text-[15px]">Tổng số vai trò</h3>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm">
              <Shield size={20} strokeWidth={2} />
            </div>
          </div>
          
          <div className="relative z-10 mb-4 flex-1 flex items-center">
             <div className="text-[48px] leading-none font-black flex items-baseline gap-2 tracking-tight">
               {roles.length} <span className="text-[15px] font-bold opacity-90 tracking-normal">ROLES</span>
             </div>
          </div>
          
          <div className="relative z-10 flex gap-3 mt-auto">
            <div className="bg-white/95 text-black px-4 py-2.5 rounded-full text-[13px] font-bold flex-1 flex justify-center items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
              {roles.length} Vai trò mặc định 
              <div className="w-4 h-4 rounded-full bg-[#9FE870] flex items-center justify-center">
                <ArrowDown size={10} className="text-[#062F28]" strokeWidth={3}/>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Cards & Search */}
        <div className="bg-gradient-to-b from-[#f8f9fa] to-[#efefef] p-6 pt-14 rounded-[24px] shadow-sm border-4 border-white lg:col-span-2 flex flex-col relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 bg-[#9FE870] px-5 py-2.5 rounded-br-[20px] z-10">
            <h3 className="font-bold text-[14px] text-[#062F28]">Phân quyền & Truy cập</h3>
          </div>
          
          <div className="relative z-10 h-full w-full">
            {/* Info text */}
            <div className="p-4 bg-white rounded-[20px] border-2 border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] w-full h-full flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#9FE870]/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-[#9FE870]/20 flex items-center justify-center border border-[#9FE870]/30 shrink-0">
                  <ShieldAlert size={16} className="text-[#062F28]" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-[#062F28] uppercase tracking-wide">Cấu trúc Phân Quyền</h4>
                </div>
              </div>
              <p className="text-[#6b6b6b] text-[12px] leading-relaxed font-medium relative z-10 max-w-xl">
                Sử dụng <span className="font-bold text-[#062F28]">Vai trò cố định</span> cho nghiệp vụ lõi. 
                Để phân quyền đặc thù, hãy cấu hình <span className="font-bold text-[#062F28]">Quyền tùy chỉnh</span> trực tiếp trên từng Nhân sự.
              </p>
            </div>
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
          {roles.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Danh sách vai trò hệ thống ({roles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {roles.map((role) => (
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

          {roles.length === 0 && (
            <div className="py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              Chưa có vai trò nào.
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
