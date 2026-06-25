import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShieldAlert, Shield, User, Users } from 'lucide-react';
import { User as UserType } from '../../../types/user.types';
import { UserFormModal } from './components/UserFormModal';
import { AdminAssignFacilityModal } from './components/AdminAssignFacilityModal';
import { UserTable } from './components/UserTable';
import { UserFilterBar } from './components/UserFilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { useUserList } from './hooks/useUserList';

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

export default function UserListPage() {
  const {
    users,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    fetchUsers,
    PAGE_LIMIT,
  } = useUserList();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined);
  const [assignTarget, setAssignTarget] = useState<UserType | null>(null);

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleAssignFacility = (user: UserType) => {
    setAssignTarget(user);
  };

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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Users &amp; Roles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage accounts and role-based access control (RBAC)
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-[#d7ee46] text-[#060606] px-5 py-2.5 rounded-xl font-bold hover:bg-[#c4dc32] transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={20} />
          Thêm Tài khoản
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <UserFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onRefresh={fetchUsers}
          onAssignFacility={handleAssignFacility}
        />
      </motion.div>

      {/* Pagination */}
      {!isLoading && (
        <motion.div variants={itemVariants}>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageLimit={PAGE_LIMIT}
            onPageChange={setCurrentPage}
            itemLabel="người dùng"
          />
        </motion.div>
      )}

      {/* RBAC Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-[#060606]">Phân quyền hệ thống (RBAC)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-red-500" /> System Admin
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Toàn quyền hệ thống. Quản lý tài khoản, cấu hình bãi xe, và nhật ký kiểm toán (Audit
                Logs).
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <Shield size={18} className="text-blue-500" /> Facility Manager
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Quản lý bãi đỗ cụ thể, xem báo cáo doanh thu, gán slot cho thẻ tháng.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors sm:col-span-2">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <User size={18} className="text-green-500" /> Parking Staff
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Vận hành trực tiếp: Quét biển số, check-in/out, thu phí tiền mặt và xử lý ngoại lệ
                tại cổng.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#060606] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-[#d7ee46]/20 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} className="text-[#d7ee46]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Tổng quan người dùng</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Quản lý tập trung toàn bộ tài khoản, vai trò và hoạt động đăng nhập trên hệ thống.
            </p>
          </div>
          <div className="mt-6">
            <div className="bg-[#d7ee46]/10 border border-[#d7ee46]/20 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">
                  Tổng số tài khoản
                </p>
                <div className="text-3xl font-bold text-white">{pagination.total}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#d7ee46]/20 flex items-center justify-center border border-[#d7ee46]/30">
                <Shield size={22} className="text-[#d7ee46]" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Admin Quick Assign Facility Modal */}
      {assignTarget && (
        <AdminAssignFacilityModal
          user={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={fetchUsers}
        />
      )}
    </motion.div>
  );
}
