import { ParkingSession, SessionStatus } from '../../../../services/session.service';

import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../../../components/ui/table';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { LoadingState } from '../../../../components/ui/LoadingState';

const STATUS_META: Record<SessionStatus, { label: string; cls: string }> = {
  [SessionStatus.ACTIVE]:          { label: 'Đang gửi',       cls: 'bg-[#dcfce7] text-[#166534]' },
  [SessionStatus.PENDING_PAYMENT]: { label: 'Chờ thanh toán', cls: 'bg-[#fef9c3] text-[#854d0e]' },
  [SessionStatus.COMPLETED]:       { label: 'Hoàn thành',     cls: 'bg-[#f5f5f4]  text-[#57534e]' },
  [SessionStatus.EXCEPTION]:       { label: 'Ngoại lệ',       cls: 'bg-[#fee2e2]  text-[#991b1b]' },
};

interface SessionTableProps {
  data: ParkingSession[];
  loading: boolean;
}

/**
 * SessionTable — Bảng danh sách lượt gửi xe.
 */
export function SessionTable({ data, loading }: SessionTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e8e9e8] p-6">
        <LoadingState rows={8} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e8e9e8] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã lượt</TableHead>
            <TableHead>Biển số</TableHead>
            <TableHead>Cổng vào</TableHead>
            <TableHead>Thời gian vào</TableHead>
            <TableHead>Thời gian ra</TableHead>
            <TableHead>Phí</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState description="Chưa có lượt gửi xe nào trong bãi đã chọn" />
              </td>
            </tr>
          ) : (
            data.map((s) => {
              const sm = STATUS_META[s.status] ?? { label: s.status, cls: 'bg-[#f5f5f4] text-[#6b6b6b]' };
              return (
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-[12px] text-[#6b6b6b]">{s.code}</TableCell>
                  <TableCell className="font-mono font-bold text-[13px]">{s.licensePlate}</TableCell>
                  <TableCell className="text-[13px] text-[#6b6b6b]">{s.gateIn}</TableCell>
                  <TableCell className="text-[12px] text-[#6b6b6b]">
                    {s.checkInTime ? new Date(s.checkInTime).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    }) : '—'}
                  </TableCell>
                  <TableCell className="text-[12px] text-[#6b6b6b]">
                    {s.checkOutTime ? new Date(s.checkOutTime).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    }) : <span className="text-[#22c55e] font-medium">Còn trong bãi</span>}
                  </TableCell>
                  <TableCell className="font-mono text-[13px]">
                    {s.totalFee > 0
                      ? <span className="font-bold">{s.totalFee.toLocaleString('vi-VN')}đ</span>
                      : <span className="text-[#a0a0a0]">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sm.cls}`}>
                      {sm.label}
                    </span>
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
