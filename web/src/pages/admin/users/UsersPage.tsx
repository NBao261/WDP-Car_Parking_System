import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShieldAlert, Shield, User, Users } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { User as UserType, PaginationMeta } from '../../../types/user.types';
import { UserFormModal } from './components/UserFormModal';
import { UserTable } from './components/UserTable';
import { UserFilterBar } from './components/UserFilterBar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

const PAGE_LIMIT = 10;

export default function UserListPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: PAGE_LIMIT, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page: currentPage, limit: PAGE_LIMIT };
      if (roleFilter !== 'ALL') params.role = roleFilter;
      // Note: backend currently doesn't support search param, filter client-side for now
      const response = await userService.getAllUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  // Client-side search filter (on top of server-filtered data)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
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
          onClick={handleCreateUser}
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
        <UserTable
          users={filteredUsers}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onRefresh={fetchUsers}
        />
      </motion.div>

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Hiển thị{' '}
            <span className="font-semibold text-[#060606]">
              {(currentPage - 1) * PAGE_LIMIT + 1}–{Math.min(currentPage * PAGE_LIMIT, pagination.total)}
            </span>{' '}
            / <span className="font-semibold text-[#060606]">{pagination.total}</span> người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span key={`ellipsis-${page}`} className="text-gray-400 px-1">
                      ...
                    </span>
                  )}
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm font-semibold rounded-xl transition-colors ${
                      page === currentPage
                        ? 'bg-[#d7ee46] text-[#060606]'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                </>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
              className="px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-[#060606]">Phân quyền hệ thống (RBAC)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d7ee46]/50 transition-colors">
              <div className="font-bold text-[#060606] flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-red-500" /> System Admin
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Toàn quyền hệ thống. Quản lý tài khoản, cấu hình bãi xe, và nhật ký kiểm toán (Audit Logs).
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
                Vận hành trực tiếp: Quét biển số, check-in/out, thu phí tiền mặt và xử lý ngoại lệ tại cổng.
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
                <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Tổng số tài khoản</p>
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
    </motion.div>
  );
}
