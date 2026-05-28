import { IException, ExceptionStatus } from '../../../../services/exception.service';

import { ExceptionStatusBadge, ExceptionTypeBadge } from '../../../../components/ui/ExceptionBadge';

import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../../../components/ui/table';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { Eye } from 'lucide-react';

interface ExceptionTableProps {
  data: IException[];
  loading: boolean;
  onReview: (exception: IException) => void;
}

/**
 * ExceptionTable — Bảng danh sách ngoại lệ cho Manager.
 * Dùng shared Table components thay vì viết <table> thủ công.
 */
export function ExceptionTable({ data, loading, onReview }: ExceptionTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e9e8] p-6">
        <LoadingState rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e8e9e8] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã lượt gửi</TableHead>
            <TableHead>Biển số</TableHead>
            <TableHead>Loại ngoại lệ</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Phụ thu</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState variant="search" />
              </td>
            </tr>
          ) : (
            data.map((ex) => {
              const session = typeof ex.sessionId === 'object' ? ex.sessionId : null;
              return (
                <TableRow key={ex._id}>
                  <TableCell className="font-mono text-[12px] text-[#6b6b6b]">
                    {session?.code ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-[13px]">
                    {session?.licensePlate ?? '—'}
                  </TableCell>
                  <TableCell>
                    <ExceptionTypeBadge type={ex.type} />
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="text-[12px] text-[#6b6b6b] line-clamp-2">{ex.description}</span>
                  </TableCell>
                  <TableCell className="font-mono text-[13px]">
                    {ex.surcharge > 0 ? (
                      <span className="text-[#c2410c] font-bold">
                        {ex.surcharge.toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className="text-[#a0a0a0]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[12px] text-[#6b6b6b]">
                    {new Date(ex.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <ExceptionStatusBadge status={ex.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => onReview(ex)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6b6b6b] border border-[#e8e9e8] px-2.5 py-1 rounded-lg hover:bg-[#f5f5f4] hover:border-[#d7ee46] transition-all"
                    >
                      <Eye size={13} />
                      {ex.status === ExceptionStatus.NEW || ex.status === ExceptionStatus.PROCESSING
                        ? 'Review'
                        : 'Xem'}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
