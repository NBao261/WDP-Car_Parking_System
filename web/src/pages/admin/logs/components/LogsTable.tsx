import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  Info,
} from 'lucide-react';
import { AuditLog } from '../../../../services/config.service';

interface LogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  indexOffset: number;
}

type SortField = 'createdAt' | 'action' | 'entity' | 'none';

/* ── Sort indicator ── */
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

/* ── Action config ── */
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

/* ── Helpers để render giá trị thân thiện ── */
function formatFieldName(key: string): string {
  const map: Record<string, string> = {
    name: 'Tên',
    email: 'Email',
    role: 'Vai trò',
    status: 'Trạng thái',
    phone: 'Số điện thoại',
    password: 'Mật khẩu',
    updatedAt: 'Cập nhật lúc',
    createdAt: 'Tạo lúc',
    isDeleted: 'Đã xoá',
    assignedFacilities: 'Cơ sở được phân công',
    facilityId: 'Mã cơ sở',
    floorId: 'Mã tầng',
    slotId: 'Mã ô đỗ',
    userId: 'Mã người dùng',
    vehicleTypeId: 'Loại phương tiện',
    description: 'Mô tả',
    address: 'Địa chỉ',
    capacity: 'Sức chứa',
    price: 'Giá',
    amount: 'Số tiền',
    method: 'Phương thức',
    value: 'Giá trị',
    key: 'Khóa',
    type: 'Loại',
    code: 'Mã',
  };
  return map[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFieldValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Có' : 'Không';
  if (typeof val === 'object') return JSON.stringify(val);
  const str = String(val);
  // Detect ISO date
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    try {
      return format(new Date(str), 'HH:mm:ss dd/MM/yyyy');
    } catch {
      return str;
    }
  }
  return str;
}

/* ── Payload detail panel ── */
function PayloadPanel({ changes }: { changes: Record<string, unknown> | null | undefined }) {
  if (!changes || Object.keys(changes).length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 text-gray-400 text-[13px]">
        <Info size={15} />
        <span>Không có dữ liệu thay đổi nào được ghi nhận</span>
      </div>
    );
  }

  const entries = Object.entries(changes).filter(
    ([key]) => !['__v', '_id', 'password'].includes(key),
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {entries.map(([key, val]) => (
        <div
          key={key}
          className="flex flex-col gap-0.5 bg-white rounded-lg px-3 py-2.5 border border-gray-100"
        >
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {formatFieldName(key)}
          </span>
          <span className="text-[13px] font-medium text-[#1a1a1a] break-all">
            {formatFieldValue(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Shared thead ── */
function TableHead({
  sortField,
  sortDir,
  onSort,
}: {
  sortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort?: (f: SortField) => void;
}) {
  return (
    <thead className="bg-[#FAFAFA] text-[#6b6b6b] text-[13px] border-b border-gray-100 font-semibold uppercase tracking-wider">
      <tr>
        <th className="px-6 py-4 w-[5%] text-center rounded-tl-2xl">STT</th>
        <th
          className={`px-6 py-4 w-[20%] ${onSort ? 'cursor-pointer select-none hover:text-[#062F28] transition-colors' : ''}`}
          onClick={() => onSort?.('createdAt')}
        >
          <span className="flex items-center gap-1.5">
            Thời gian
            <SortIcon field="createdAt" active={sortField === 'createdAt'} dir={sortDir} />
          </span>
        </th>
        <th className="px-6 py-4 w-[25%]">Người thực hiện</th>
        <th
          className={`px-6 py-4 w-[15%] ${onSort ? 'cursor-pointer select-none hover:text-[#062F28] transition-colors' : ''}`}
          onClick={() => onSort?.('action')}
        >
          <span className="flex items-center gap-1.5">
            Hành động
            <SortIcon field="action" active={sortField === 'action'} dir={sortDir} />
          </span>
        </th>
        <th
          className={`px-6 py-4 w-[25%] ${onSort ? 'cursor-pointer select-none hover:text-[#062F28] transition-colors' : ''}`}
          onClick={() => onSort?.('entity')}
        >
          <span className="flex items-center gap-1.5">
            Đối tượng
            <SortIcon field="entity" active={sortField === 'entity'} dir={sortDir} />
          </span>
        </th>
        <th className="px-6 py-4 text-right rounded-tr-2xl w-[10%]">Chi tiết</th>
      </tr>
    </thead>
  );
}

/* ══════════════════════════════════════════════════════ */
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

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <TableHead sortField={sortField} sortDir={sortDir} />
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

  /* ── Empty state ── */
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <TableHead sortField={sortField} sortDir={sortDir} />
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

  /* ── Main table ── */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <TableHead sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
          <tbody>
            {sorted.map((log, index) => {
              const isExpanded = expandedLogId === log._id;
              return (
                <React.Fragment key={log._id}>
                  {/* ── Data row ── */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-gray-50 hover:bg-[#9FE870]/5 transition-colors cursor-pointer ${
                      isExpanded ? 'bg-[#f0fdf4]' : ''
                    }`}
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
                          <div className="text-[11px] text-gray-400 mt-0.5 capitalize">
                            {log.userId?.role || 'system'}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Hành động */}
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
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                        className={`p-2 rounded-xl transition-all ${
                          isExpanded
                            ? 'bg-[#132c20] text-white'
                            : 'text-gray-400 hover:text-[#132c20] hover:bg-[#132c20]/5'
                        }`}
                        aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </motion.tr>

                  {/* ── Expanded detail row — dùng CSS transition, KHÔNG dùng motion.tr ── */}
                  <tr className={`border-b border-gray-100 ${isExpanded ? 'bg-[#f8fffe]' : ''}`}>
                    <td colSpan={6} className="p-0 border-none">
                      <div
                        style={{
                          maxHeight: isExpanded ? '1000px' : '0px',
                          overflow: 'hidden',
                          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <div
                          style={{
                            opacity: isExpanded ? 1 : 0,
                            transition: 'opacity 0.25s ease',
                            transitionDelay: isExpanded ? '0.08s' : '0s',
                          }}
                          className="px-6 py-4"
                        >
                          {/* Header của panel chi tiết */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md bg-[#132c20]/10 flex items-center justify-center">
                              <Info size={13} className="text-[#132c20]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#132c20] uppercase tracking-wide">
                              Chi tiết thay đổi
                            </span>
                            {log.ipAddress && (
                              <span className="ml-auto text-[11px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                IP: {log.ipAddress}
                              </span>
                            )}
                          </div>

                          {/* Key-value table */}
                          <PayloadPanel changes={log.changes as any} />
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
