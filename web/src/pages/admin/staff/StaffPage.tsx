import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Plus, Edit2, Trash2, Shield, UserPlus, FileEdit, UserCheck, ArrowDown, ArrowUpRight, ShieldAlert, User, Users } from 'lucide-react';
import { User as UserType } from '../../../types/user.types';
import { StaffFormModal } from './components/StaffFormModal';
import { AdminAssignFacilityModal } from './components/AdminAssignFacilityModal';
import { StaffTable } from './components/StaffTable';
import { StaffFilterBar } from './components/StaffFilterBar';
import { Pagination } from '../../../components/ui/Pagination';
import { useStaffList } from './hooks/useStaffList';

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

export default function StaffPage() {
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
  } = useStaffList();

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
          <h1 className="text-2xl font-bold text-[#062F28]">Quản lý Nhân Sự</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý tài khoản nhân viên và phân quyền (RBAC)
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-black text-white hover:bg-black/80 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={20} />
          Thêm Nhân Sự
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <StaffFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <StaffTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onRefresh={fetchUsers}
          onAssignFacility={handleAssignFacility}
          indexOffset={(currentPage - 1) * PAGE_LIMIT}
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
            itemLabel="nhân sự"
          />
        </motion.div>
      )}

      {/* Overview & RBAC Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tổng quan người dùng (Left, Green Card) */}
        <div className="bg-[#9FE870] p-6 rounded-[24px] shadow-sm text-[#062F28] flex flex-col justify-between relative overflow-hidden min-h-[220px]">
          {/* Decorative background shapes simulating the image's waves */}
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full border-[30px] border-white/20 blur-[2px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full border-[40px] border-white/10 blur-[2px] pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <h3 className="font-medium text-[16px]">Tổng số nhân sự</h3>
            <button
              onClick={handleCreateUser}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Plus size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="relative z-10 mt-2 mb-8">
            <div className="text-[44px] leading-none font-bold flex items-baseline gap-2">
              {pagination.total} <span className="text-[16px] font-medium opacity-90">STAFF</span>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 mt-auto">
            <button
              onClick={fetchUsers}
              className="bg-white text-black px-6 py-3 rounded-full text-[14px] font-medium hover:bg-gray-50 flex-1 flex justify-center items-center gap-2 shadow-sm transition-colors"
            >
              Làm mới 
              <div className="w-4 h-4 rounded-full bg-[#9FE870] flex items-center justify-center">
                <ArrowDown size={10} className="text-[#062F28]" strokeWidth={3} />
              </div>
            </button>
            <button
              onClick={handleCreateUser}
              className="bg-[#111111] text-white px-6 py-3 rounded-full text-[14px] font-medium hover:bg-black/90 flex-1 flex justify-center items-center gap-2 shadow-sm transition-colors"
            >
              Thêm Nhân sự <ArrowUpRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* RBAC Info Cards (Right, White Card) */}
        <div className="bg-gradient-to-b from-[#f8f9fa] to-[#efefef] p-6 pt-16 rounded-[24px] shadow-sm border-4 border-white lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#9FE870] px-6 py-3 rounded-br-[24px] z-10">
            <h3 className="font-bold text-[15px] text-[#062F28]">Phân quyền hệ thống (RBAC)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {/* System Admin */}
            <div className="p-5 bg-white rounded-[20px] border border-gray-100 hover:border-[#9FE870]/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                  <ShieldAlert size={18} className="text-red-500" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">System Admin</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Toàn quyền</div>
              <p className="text-[#6b6b6b] text-[11px] leading-relaxed font-semibold">
                Quản lý tài khoản, bãi xe và nhật ký kiểm toán.
              </p>
            </div>

            {/* Facility Manager */}
            <div className="p-5 bg-white rounded-[20px] border border-gray-100 hover:border-[#9FE870]/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Shield size={18} className="text-blue-500" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">Facility Manager</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Quản lý bãi đỗ</div>
              <p className="text-[#6b6b6b] text-[11px] leading-relaxed font-semibold">
                Xem doanh thu, thiết lập và gán slot thẻ tháng.
              </p>
            </div>

            {/* Parking Staff */}
            <div className="p-5 bg-white rounded-[20px] border border-gray-100 hover:border-[#9FE870]/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#9FE870]/20 flex items-center justify-center border border-[#9FE870]/30">
                  <User size={18} className="text-[#062F28]" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">Parking Staff</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Vận hành trực tiếp</div>
              <p className="text-[#6b6b6b] text-[11px] leading-relaxed font-semibold">
                Quét biển số, check-in/out, thu phí tiền mặt tại cổng.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Form Modal */}
      <StaffFormModal
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
