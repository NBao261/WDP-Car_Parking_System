import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowDown, ArrowUpRight, Users, UserCheck } from 'lucide-react';
import { User as UserType } from '../../../../types/user.types';
import { CustomerFilterBar } from './components/CustomerFilterBar';
import { CustomerTable } from './components/CustomerTable';
import { CustomerFormModal } from './components/CustomerFormModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { useCustomerList } from './hooks/useCustomerList';
import { Pagination } from '../../../components/ui/Pagination';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CustomersPage() {
  const {
    users,
    pagination,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter: statusFilter, // mapping roleFilter from hook to statusFilter
    setRoleFilter: setStatusFilter,
    currentPage,
    setCurrentPage,
    fetchUsers,
    PAGE_LIMIT,
  } = useCustomerList();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailUser, setSelectedDetailUser] = useState<UserType | null>(null);

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleViewDetail = (user: UserType) => {
    setSelectedDetailUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      className="space-y-6"
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
          <h1 className="text-2xl font-bold text-[#062F28]">Quản lý Khách Hàng</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý tài khoản khách hàng, lịch sử đỗ xe và phương tiện
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-black text-white hover:bg-black/80 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={20} />
          Thêm Khách Hàng
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <CustomerFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <CustomerTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onViewDetail={handleViewDetail}
          onRefresh={fetchUsers}
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
            itemLabel="khách hàng"
          />
        </motion.div>
      )}

      {/* Overview Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tổng quan khách hàng (Left, Green Card) */}
        <div className="bg-[#9FE870] p-6 rounded-[24px] shadow-sm text-[#062F28] flex flex-col justify-between relative overflow-hidden min-h-[220px]">
          {/* Decorative background shapes */}
          <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full border-[30px] border-white/20 blur-[2px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full border-[40px] border-white/10 blur-[2px] pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <h3 className="font-medium text-[16px]">Tổng số khách hàng</h3>
            <button
              onClick={handleCreateUser}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm hover:bg-gray-50 transition-colors"
            >
              <UserPlus size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="relative z-10 mt-2 mb-8">
            <div className="text-[44px] leading-none font-bold flex items-baseline gap-2">
              {pagination.total} <span className="text-[16px] font-medium opacity-90">USERS</span>
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
              Thêm KH <ArrowUpRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Feature Info Cards (Right, White Card) */}
        <div className="bg-gradient-to-b from-[#f8f9fa] to-[#efefef] p-6 pt-16 rounded-[24px] shadow-sm border-4 border-white lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#9FE870] px-6 py-3 rounded-br-[24px] z-10">
            <h3 className="font-bold text-[15px] text-[#062F28]">Tính năng Quản lý Khách hàng</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {/* Cập nhật thông tin */}
            <div className="p-5 bg-white rounded-[20px] border border-gray-100 hover:border-[#9FE870]/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Users size={18} className="text-blue-500" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">Cập nhật Thông tin</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Thêm / Sửa nhanh</div>
              <p className="text-[#6b6b6b] text-[11px] leading-relaxed font-semibold">
                Dễ dàng thêm mới khách hàng, thay đổi thông tin liên lạc và đặt lại mật khẩu bảo
                mật.
              </p>
            </div>

            {/* Quản lý trạng thái */}
            <div className="p-5 bg-white rounded-[20px] border border-gray-100 hover:border-[#9FE870]/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#9FE870]/20 flex items-center justify-center border border-[#9FE870]/30">
                  <UserCheck size={18} className="text-[#062F28]" />
                </div>
                <span className="font-bold text-sm text-[#062F28]">Quản lý Trạng thái</span>
              </div>
              <div className="text-lg font-extrabold text-[#062F28] mb-1">Khóa / Mở khóa</div>
              <p className="text-[#6b6b6b] text-[11px] leading-relaxed font-semibold">
                Kiểm soát quyền truy cập hệ thống của khách hàng thông qua tính năng khóa tài khoản.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedDetailUser}
        onRefresh={fetchUsers}
      />
    </motion.div>
  );
}
