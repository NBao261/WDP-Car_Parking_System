import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { configService, AuditLog } from '../../../../services/config.service';

export function useLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  
  const PAGE_LIMIT = 15;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await configService.getLogs({
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        page: currentPage,
        limit: PAGE_LIMIT,
      });

      if (response.success) {
        setLogs(response.data);
        setPagination({
          total: response.pagination.total,
          pages: response.pagination.pages,
        });
      }
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách nhật ký');
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter, currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, entityFilter]);

  return {
    logs,
    isLoading,
    actionFilter,
    setActionFilter,
    entityFilter,
    setEntityFilter,
    currentPage,
    setCurrentPage,
    pagination,
    PAGE_LIMIT,
    fetchLogs,
  };
}
