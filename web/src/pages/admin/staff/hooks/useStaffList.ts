import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/user.service';
import { User as UserType, PaginationMeta } from '@/types/user.types';

const PAGE_LIMIT = 10;

/**
 * Manages data fetching, filtering, and pagination state for the Users list page.
 */
export function useStaffList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page: currentPage, limit: PAGE_LIMIT };
      if (roleFilter !== 'ALL') {
        params.role = roleFilter;
      } else {
        // When ALL is selected on Staff page, only fetch internal roles
        params.role = 'admin,manager,staff';
      }
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

  // Client-side search filter on top of server-filtered data
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return {
    users: filteredUsers,
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
  };
}
