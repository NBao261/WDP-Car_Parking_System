import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ShieldAlert } from 'lucide-react';
import { configService, AuditLog } from '../../../services/config.service';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table';

const ACTION_LABELS: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  export: 'Xuất file',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  check_in: 'Check-in',
  check_out: 'Check-out',
};

const RESULT_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  failure: 'bg-red-50 text-red-700',
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditLogWidget() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [noPermission, setNoPermission] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (actionFilter) params.action = actionFilter;
      const res = await configService.getLogs(params);
      setLogs(res.data ?? []);
      setTotalPages(res.pagination?.pages ?? 1);
      setNoPermission(false);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.status === 403) {
        setNoPermission(true);
      } else {
        console.error('Failed to fetch audit logs', err);
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search filtering
  const filteredLogs = search
    ? logs.filter(
      (log) =>
        (log.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entity.toLowerCase().includes(search.toLowerCase())
    )
    : logs;

  if (noPermission) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col items-center justify-center gap-3">
        <ShieldAlert size={32} className="text-gray-300" />
        <p className="text-[14px] text-gray-400 font-medium">Bạn không có quyền xem nhật ký hoạt động</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Nhật ký hoạt động</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">Truy vết hành động trên hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#86cd3d]/50 w-[180px] transition-colors"
            />
          </div>
          {/* Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#86cd3d]/50 cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="create">Tạo mới</option>
            <option value="update">Cập nhật</option>
            <option value="delete">Xóa</option>
            <option value="export">Xuất file</option>
            <option value="check_in">Check-in</option>
            <option value="check_out">Check-out</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-5 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-[#86cd3d]" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-gray-400">Chưa có dữ liệu</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[12px] py-2 px-3">Thời gian</TableHead>
                <TableHead className="text-[12px] py-2 px-3">Người dùng</TableHead>
                <TableHead className="text-[12px] py-2 px-3">Hành động</TableHead>
                <TableHead className="text-[12px] py-2 px-3">Đối tượng</TableHead>
                <TableHead className="text-[12px] py-2 px-3 text-right">Kết quả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log._id} className="group">
                  <TableCell className="text-[12px] py-2 px-3 tabular-nums text-gray-500 whitespace-nowrap">
                    {formatTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-[12px] py-2 px-3">
                    <div className="font-medium text-gray-800 truncate max-w-[140px]">
                      {log.userId?.name || 'Hệ thống'}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                      {log.userId?.email || ''}
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] py-2 px-3 font-medium text-gray-700">
                    {ACTION_LABELS[log.action] || log.action}
                  </TableCell>
                  <TableCell className="text-[12px] py-2 px-3 text-gray-500 truncate max-w-[120px]">
                    {log.entity}
                  </TableCell>
                  <TableCell className="text-[12px] py-2 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${RESULT_STYLES[log.result] || 'bg-gray-50 text-gray-500'
                        }`}
                    >
                      {log.result === 'success' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 flex-shrink-0">
          <span className="text-[12px] text-gray-400">
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 text-[12px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 text-[12px] rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
