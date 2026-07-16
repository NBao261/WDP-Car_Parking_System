import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FileJson,
  Package,
  User,
} from 'lucide-react';
import { AuditLog } from '../../../../services/config.service';

interface LogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  indexOffset: number;
}

type SortField = 'createdAt' | 'action' | 'entity' | 'none';

function SortIcon({
  field,
  active,
  dir,
}: {
  field: string;
  active: boolean;
  dir: 'asc' | 'desc';
}) {
  return (
    <span className="flex items-center gap-1.5">
      <ArrowUpDown size={14} className={active ? 'text-[#9FE870]' : 'text-gray-300'} />
      {active && (
        <span className="text-[10px] text-[#9FE870] font-bold">
          {field === 'createdAt' ? (dir === 'desc' ? '↓ Mới' : '↑ Cũ') : dir === 'asc' ? 'A-Z' : 'Z-A'}
        </span>
      )}
    </span>
  );
}

const ACTION_STYLE: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xoá',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
};

export function LogsTable({ logs, isLoading, indexOffset }: LogsTableProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    } else if (sortDir === (field === 'createdAt' ? 'desc' : 'asc')) {
      setSortDir(field === 'createdAt' ? 'asc' : 'desc');
    } else {
      setSortField('createdAt');
      setSortDir('desc');
    }
  };

  const sorted = [...logs].sort((a, b) => {
    if (sortField === 'none') return 0;
    let aVal: any = sortField === 'createdAt' ? new Date(a.createdAt).getTime() : a[sortField];
    let bVal: any = sortField === 'createdAt' ? new Date(b.createdAt).getTime() : b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#FAFAFA] text-[#6b6b6b] text-[13px] border-b border-gray-100 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-[5%] text-center rounded-tl-2xl">STT</th>
              <th className="px-6 py-4 w-[20%]">Thời gian</th>
              <th className="px-6 py-4 w-[25%]">Người thực hiện</th>
              <th className="px-6 py-4 w-[15%]">Hành động</th>
              <th className="px-6 py-4 w-[25%]">Đối tượng</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded mx-auto w-5" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-36" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded w-28" />
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-lg w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-100 rounded-xl ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Empty state ──
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#FAFAFA] text-[#6b6b6b] text-[13px] border-b border-gray-100 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 w-[5%] text-center rounded-tl-2xl">STT</th>
              <th className="px-6 py-4 w-[20%]">Thời gian</th>
              <th className="px-6 py-4 w-[25%]">Người thực hiện</th>
              <th className="px-6 py-4 w-[15%]">Hành động</th>
              <th className="px-6 py-4 w-[25%]">Đối tượng</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-14 text-center text-gray-400">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package size={22} className="text-gray-300" />
                </div>
                Chưa có nhật ký hoạt động nào phù hợp với bộ lọc
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ── Table ──
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#FAFAFA] text-[#6b6b6b] text-[13px] border-b border-gray-100 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl w-[5%] text-center">STT</th>
              {/* Sortable: Thời gian */}
              <th
                className="px-6 py-4 w-[20%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                onClick={() => toggleSort('createdAt')}
              >
                <span className="flex items-center gap-1.5">
                  Thời gian
                  <SortIcon field="createdAt" active={sortField === 'createdAt'} dir={sortDir} />
                </span>
              </th>
              <th className="px-6 py-4 w-[25%]">Người thực hiện</th>
              {/* Sortable: Hành động */}
              <th
                className="px-6 py-4 w-[15%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                onClick={() => toggleSort('action')}
              >
                <span className="flex items-center gap-1.5">
                  Hành động
                  <SortIcon field="action" active={sortField === 'action'} dir={sortDir} />
                </span>
              </th>
              {/* Sortable: Đối tượng */}
              <th
                className="px-6 py-4 w-[25%] cursor-pointer select-none hover:text-[#062F28] transition-colors"
                onClick={() => toggleSort('entity')}
              >
                <span className="flex items-center gap-1.5">
                  Đối tượng
                  <SortIcon field="entity" active={sortField === 'entity'} dir={sortDir} />
                </span>
              </th>
              <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((log, index) => {
              const isExpanded = expandedLogId === log._id;
              return (
                <React.Fragment key={log._id}>
                  <tr
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/50' : ''}`}
                    onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                  >
                    {/* STT */}
                    <td className="px-6 py-4 text-center text-[13px] text-gray-400 font-medium">
                      {indexOffset + index + 1}
                    </td>
                    {/* Thời gian */}
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-semibold text-gray-800">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    {/* Người thực hiện */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#132c20]/10 flex items-center justify-center shrink-0">
                          <User size={14} className="text-[#132c20]" />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900 leading-tight">
                            {log.userId?.name || 'Hệ thống'}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {log.userId?.role || 'SYSTEM'}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Hành động badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold ${
                          ACTION_STYLE[log.action] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ACTION_LABEL[log.action] ?? log.action}
                      </span>
                    </td>
                    {/* Đối tượng */}
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-semibold text-gray-800">{log.entity}</div>
                      {log.entityId && (
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          #{log.entityId.slice(-8)}
                        </div>
                      )}
                    </td>
                    {/* Expand toggle */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLogId(isExpanded ? null : log._id);
                        }}
                        className="p-2 text-gray-400 hover:text-[#132c20] hover:bg-[#132c20]/5 rounded-xl transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded payload row */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-gray-50/40 border-b border-gray-100"
                      >
                        <td colSpan={6} className="px-6 pb-4 pt-2">
                          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative">
                            <div className="absolute top-4 right-4 flex items-center gap-2 text-gray-400">
                              <FileJson size={15} />
                              <span className="text-[11px] font-medium uppercase tracking-wider">Payload</span>
                            </div>
                            <pre className="text-sm text-emerald-400 font-mono mt-1 leading-relaxed">
                              {log.changes
                                ? JSON.stringify(log.changes, null, 2)
                                : '// Không có dữ liệu thay đổi'}
                            </pre>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
