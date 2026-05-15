import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShieldAlert, Shield, User, AlertCircle } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { User as UserType } from '../../../types/user.types';
import { UserRole } from '../../../../../shared/types';
import { UserFormModal } from './components/UserFormModal';
import { UserTable } from './components/UserTable';
import { UserFilterBar } from './components/UserFilterBar';

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

// Fallback mock data in case API is down during development
const mockUsers: UserType[] = [
  { _id: '1', name: 'Super Admin', email: 'admin@parkmaster.com', phone: '0987654321', role: UserRole.ADMIN, status: 'active', assignedFacilities: [], customPermissions: [], lastLogin: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '2', name: 'Trần Quản Lý', email: 'manager01@parkmaster.com', phone: '0987654322', role: UserRole.MANAGER, status: 'active', assignedFacilities: [], customPermissions: [], lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '3', name: 'Lê Nhân Viên', email: 'staff01@parkmaster.com', phone: '0987654323', role: UserRole.STAFF, status: 'active', assignedFacilities: [], customPermissions: [], lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: '4', name: 'Nguyễn Tạm Khóa', email: 'staff02@parkmaster.com', phone: '0987654324', role: UserRole.STAFF, status: 'locked', assignedFacilities: [], customPermissions: [], lastLogin: new Date(Date.now() - 604800000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function UserListPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users, using mock data", error);
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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
          <h1 className="text-2xl font-bold text-[#060606]">Users & Roles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage accounts and role-based access control (RBAC)</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(undefined);
            setIsModalOpen(true);
          }}
          className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={20} />
          Thêm Tài khoản
        </button>
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <UserFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants}>
        <UserTable users={filteredUsers} isLoading={isLoading} onEdit={handleEditUser} />
      </motion.div>

      {/* Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-[#060606]">Phân quyền hệ thống (RBAC)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-red-500" /> System Admin
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Toàn quyền hệ thống. Quản lý tài khoản, cấu hình bãi xe, và nhật ký kiểm toán (Audit Logs).</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <Shield size={18} className="text-blue-500" /> Facility Manager
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Quản lý bãi đỗ cụ thể, xem báo cáo doanh thu, gán slot cho thẻ tháng.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors sm:col-span-2">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <User size={18} className="text-green-500" /> Parking Staff
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Vận hành trực tiếp: Quét biển số, check-in/out, thu phí tiền mặt và xử lý ngoại lệ tại cổng.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#060606] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center">
          <div className="w-12 h-12 bg-[#d7ee46]/20 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-[#d7ee46]" />
          </div>
          <h3 className="font-bold text-lg mb-2">Bảo mật tài khoản</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Hệ thống yêu cầu các tài khoản Staff mới phải đổi mật khẩu ở lần đăng nhập đầu tiên (Must Change Password).
          </p>
          <button className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors w-full">
            Cấu hình bảo mật
          </button>
        </div>
      </motion.div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </motion.div>
  );
}
