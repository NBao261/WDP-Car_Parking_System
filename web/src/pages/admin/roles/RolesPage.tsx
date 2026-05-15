import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { roleService } from '../../../services/role.service';
import { Role } from '../../../types/role.types';
import { PermissionMatrixModal } from './components/PermissionMatrixModal';
import { RoleFormModal } from './components/RoleFormModal';
import { RoleCard } from './components/RoleCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

// Fallback mock data if API is down
const mockRoles: Role[] = [
  { _id: '1', code: 'ROLE_ADMIN', name: 'System Admin', description: 'Toàn quyền kiểm soát hệ thống, thiết lập bãi xe, xem mọi báo cáo và quản lý tài khoản.', permissions: ['users:read', 'users:write', 'users:delete', 'roles:manage', 'facilities:read', 'facilities:write', 'zones:read', 'zones:write', 'vehicles:read', 'vehicles:write', 'checkin:manage', 'gates:control', 'billing:read', 'billing:export', 'pricing:manage'], isDefault: true },
  { _id: '2', code: 'ROLE_MANAGER', name: 'Facility Manager', description: 'Quản lý doanh thu, xem báo cáo, cấu hình khu vực bên trong bãi xe được phân công.', permissions: ['users:read', 'facilities:read', 'zones:read', 'zones:write', 'vehicles:read', 'vehicles:write', 'billing:read', 'billing:export'], isDefault: true },
  { _id: '3', code: 'ROLE_STAFF', name: 'Parking Staff', description: 'Vận hành trực tiếp tại cổng, check-in, check-out, và thu tiền mặt.', permissions: ['vehicles:read', 'checkin:manage', 'gates:control'], isDefault: true },
];

export default function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles, using mock data", error);
      setRoles(mockRoles);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleConfigPerms = (role: Role) => {
    setSelectedRole(role);
    setIsPermModalOpen(true);
  };

  return (
    <motion.div 
      className="space-y-6 max-w-[1400px] mx-auto pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Phân quyền (Roles & Permissions)</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các nhóm quyền hạn truy cập hệ thống</p>
        </div>
        <button 
          onClick={() => {
            setSelectedRole(null);
            setIsFormModalOpen(true);
          }}
          className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} strokeWidth={3} />
          Tạo Role Mới
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm Role theo tên hoặc mã..." 
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
          <p className="text-gray-500 font-medium">Đang tải danh sách phân quyền...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoles.map(role => (
            <RoleCard 
              key={role._id} 
              role={role} 
              onEdit={handleEditRole}
              onConfigPerms={handleConfigPerms}
            />
          ))}
          
          {filteredRoles.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              Không tìm thấy role nào phù hợp.
            </div>
          )}
        </motion.div>
      )}

      <PermissionMatrixModal 
        isOpen={isPermModalOpen} 
        onClose={() => setIsPermModalOpen(false)}
        role={selectedRole}
        onSuccess={fetchRoles}
      />

      <RoleFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        role={selectedRole || undefined}
        onSuccess={fetchRoles}
      />
    </motion.div>
  );
}
