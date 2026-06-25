import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
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

  const defaultRoles = filteredRoles.filter((r) => r.isDefault);
  const customRoles = filteredRoles.filter((r) => !r.isDefault);

  return (
    <motion.div
      className="space-y-6 max-w-[1400px] mx-auto pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Phân quyền hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý vai trò và quyền hạn. Có{' '}
            <span className="font-semibold text-[#060606]">{roles.length}</span> vai trò (
            {defaultRoles.length} mặc định, {customRoles.length} tùy chỉnh).
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm vai trò theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-8 h-8 border-4 border-[#d7ee46] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải danh sách vai trò...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-6">
          {/* Default Roles Section */}
          {defaultRoles.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Vai trò hệ thống mặc định ({defaultRoles.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {defaultRoles.map((role) => (
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

          {/* Custom Roles Section */}
          {customRoles.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Vai trò tùy chỉnh ({customRoles.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {customRoles.map((role) => (
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
